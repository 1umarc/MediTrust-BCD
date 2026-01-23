import React from "react";

export function Connect() {
  return (
    <div>
      <appkit-button
        label="Connect Wallet"
        balance="show"
        size="sm"
        loadingLabel="Connecting..."
      />
    </div>
  );
}