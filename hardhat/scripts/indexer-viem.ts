import "dotenv/config";
import hre from "hardhat";
import { Pool } from "pg";
import { getAbiItem, type Abi } from "viem";

// ===== ENV =====
const chainId = BigInt(process.env.CHAIN_ID || "31337");
const ID = `meditrust_${chainId.toString()}`;

function reqEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

// ===== DB helpers =====
async function getLastBlock(pool: Pool): Promise<bigint> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS indexer_state (
      id TEXT PRIMARY KEY,
      last_block BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  const r = await pool.query(
    "SELECT last_block FROM indexer_state WHERE id=$1",
    [ID]
  );

  return BigInt(r.rows[0]?.last_block ?? 0);
}

async function setLastBlock(pool: Pool, lastBlock: bigint) {
  await pool.query(
    `INSERT INTO indexer_state (id, last_block)
     VALUES ($1, $2)
     ON CONFLICT (id)
     DO UPDATE SET last_block=EXCLUDED.last_block, updated_at=NOW()`,
    [ID, lastBlock.toString()]
  );
}

// ===== MAIN =====
async function main() {
  const pool = new Pool({
    connectionString: reqEnv("DATABASE_URL"),
  });

  const publicClient = await hre.viem.getPublicClient();

  const campaignAddr = reqEnv("CAMPAIGN_ADDRESS") as `0x${string}`;
  const fundsAddr = reqEnv("FUNDS_ADDRESS") as `0x${string}`;

  // ===== Load ABIs =====
  const campaignArt = await hre.artifacts.readArtifact(
    "MediTrustCampaign"
  );
  const fundsArt = await hre.artifacts.readArtifact(
    "MediTrustFunds"
  );

  const campaignAbi = campaignArt.abi as Abi;
  const fundsAbi = fundsArt.abi as Abi;

  // ===== Events =====
  const CAMPAIGN_SUBMIT = getAbiItem({
    abi: campaignAbi,
    name: "CampaignSubmit",
  });

  const DONATION_RECEIVE = getAbiItem({
    abi: fundsAbi,
    name: "DonationReceive",
  });

  // ===== Starting block =====
  let fromBlock = await getLastBlock(pool);
  if (fromBlock === 0n) fromBlock = 1n;

  console.log("Indexer starting from block:", fromBlock.toString());

  // =====================================================
  // 🔹 BACKFILL
  // =====================================================
  const latest = await publicClient.getBlockNumber();

  const chunk = 2000n;

  for (let start = fromBlock; start <= latest; start += chunk) {
    const end =
      start + chunk - 1n > latest ? latest : start + chunk - 1n;

    console.log(`Backfill ${start} → ${end}`);

    // =============================
    // CampaignSubmit
    // =============================
    const submits = await publicClient.getLogs({
      address: campaignAddr,
      event: CAMPAIGN_SUBMIT as any,
      fromBlock: start,
      toBlock: end,
    });

    for (const log of submits) {
      const a: any = log.args;

      const campaignID =
        a.campaignID?.toString?.() ?? a[0].toString();
      const patient = a.patient ?? a[1];
      const target =
        a.target?.toString?.() ?? a[2].toString();
      const ipfsHash = a.ipfsHash ?? a[3];

      await pool.query(
        `INSERT INTO campaigns
        (campaign_id, chain_id, patient_address,
         target_wei, raised_wei, ipfs_hash,
         status, start_date_unix, created_tx_hash, updated_at)
         VALUES ($1,$2,$3,$4,0,$5,0,$6,$7,NOW())
         ON CONFLICT (campaign_id, chain_id)
         DO UPDATE SET
           patient_address=EXCLUDED.patient_address,
           target_wei=EXCLUDED.target_wei,
           ipfs_hash=EXCLUDED.ipfs_hash,
           updated_at=NOW()`,
        [
          campaignID,
          chainId.toString(),
          patient,
          target,
          ipfsHash,
          (log.blockNumber ?? 0n).toString(),
          log.transactionHash,
        ]
      );
    }

    // =============================
    // DonationReceive
    // =============================
    const dons = await publicClient.getLogs({
      address: fundsAddr,
      event: DONATION_RECEIVE as any,
      fromBlock: start,
      toBlock: end,
    });

    for (const log of dons) {
      const a: any = log.args;

      const campaignID =
        a.campaignID?.toString?.() ?? a[0].toString();
      const donor = a.donor ?? a[1];
      const amount =
        a.amount?.toString?.() ?? a[2].toString();

      // insert donation
      await pool.query(
        `INSERT INTO donations
        (chain_id, campaign_id, donor_address,
         amount_wei, tx_hash, block_number, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,NOW())
         ON CONFLICT (tx_hash) DO NOTHING`,
        [
          chainId.toString(),
          campaignID,
          donor,
          amount,
          log.transactionHash,
          (log.blockNumber ?? 0n).toString(),
        ]
      );

      // update campaign raised cache
      await pool.query(
        `UPDATE campaigns
         SET raised_wei = COALESCE(raised_wei,0) + $1,
             updated_at=NOW()
         WHERE campaign_id=$2 AND chain_id=$3`,
        [amount, campaignID, chainId.toString()]
      );
    }

    await setLastBlock(pool, end + 1n);
    fromBlock = end + 1n;
  }

  console.log("Backfill complete. Watching new events...");

  // =====================================================
  // 🔹 LIVE WATCH
  // =====================================================
  publicClient.watchContractEvent({
    address: fundsAddr,
    abi: fundsAbi,
    eventName: "DonationReceive",
    onLogs: async (logs) => {
      for (const log of logs as any[]) {
        const a = log.args;

        const campaignID = a.campaignID.toString();
        const donor = a.donor as string;
        const amount = a.amount.toString();

        await pool.query(
          `INSERT INTO donations
          (chain_id, campaign_id, donor_address,
           amount_wei, tx_hash, block_number, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,NOW())
           ON CONFLICT (tx_hash) DO NOTHING`,
          [
            chainId.toString(),
            campaignID,
            donor,
            amount,
            log.transactionHash,
            log.blockNumber.toString(),
          ]
        );

        await pool.query(
          `UPDATE campaigns
           SET raised_wei = COALESCE(raised_wei,0) + $1,
               updated_at=NOW()
           WHERE campaign_id=$2 AND chain_id=$3`,
          [amount, campaignID, chainId.toString()]
        );
      }

      console.log("Indexed DonationReceive:", logs.length);
    },
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});