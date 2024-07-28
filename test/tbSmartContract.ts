const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Tokenized bonds Test", () => {
  let tbContract;
  let tbProxyContract;
  let tbImplementationContract;
  let signers;

  const invalidAddress = "0x0000000000000000000000000000000000000000";

  before(async () => {
    signers = await ethers.getSigners();

    // deploy implementation contract
    const TBImpl = await ethers.getContractFactory("TokenizationImplementation");
    const tbImpl = await TBImpl.deploy();


    await tbImpl.waitForDeployment();
    tbImplementationContract = tbImpl.target;
    console.log("tbImplementationContract: ", tbImplementationContract);

    // deploy implementation proxy contract
    const ProxyTBImpl = await ethers.getContractFactory("TBProxy");
    const proxyTBImpl = await ProxyTBImpl.deploy(tbImplementationContract);
    await proxyTBImpl.waitForDeployment();

    tbProxyContract = proxyTBImpl.target;

    // attach proxy to implementation contract
    tbContract = TBImpl.attach(tbProxyContract);
  });

  describe("Test deployment", async () => {
    it("should deploy Tokenized bond implementation contract", async () => {
      expect(tbImplementationContract).to.not.be.undefined;
      expect(tbImplementationContract).to.be.a("string");
      expect(tbImplementationContract).to.not.equal(
        "0x0000000000000000000000000000000000000000"
      );
    });

    it("should deploy Tokenized bond proxy contract", async () => {
      expect(tbProxyContract).to.not.be.undefined;
      expect(tbProxyContract).to.be.a("string");
      expect(tbProxyContract).to.not.equal(
        "0x0000000000000000000000000000000000000000"
      );
    });
  });

  describe("Test Minter Add", async () => {
    it("should fail if caller is not contract owner", async () => {
      await expect(
        tbContract.connect(signers[2]).addMinter(await signers[2].getAddress())
      ).to.be.reverted;
    });
    it("should successfully add a minter", async () => {
      const minter = await tbContract.addMinter(await signers[2].getAddress());
      expect(minter.hash).to.not.be.undefined;
      expect(minter.hash).to.be.a("string");
    });
  });

  describe("Test Minter Replace", async () => {
    it("should fail if caller is not contract owner", async () => {
      await expect(
        tbContract
          .connect(signers[2])
          .replaceMinter(
            await signers[2].getAddress(),
            await signers[3].getAddress()
          )
      ).to.be.reverted;
    });

    it("should fail if contract is paused", async () => {
      await tbContract.pause();
      await expect(
        tbContract.replaceMinter(
          await signers[2].getAddress(),
          await signers[3].getAddress()
        )
      ).to.be.reverted;
    });

    it("should fail if new minter address is invalid", async () => {
      await tbContract.resume();
      await expect(
        tbContract.replaceMinter(await signers[2].getAddress(), invalidAddress)
      ).to.be.reverted;
    });

    it("should fail if previous minter doesn't exist", async () => {
      await expect(
        tbContract.replaceMinter(
          await signers[1].getAddress(),
          await signers[3].getAddress()
        )
      ).to.be.reverted;
    });

    it("should fail if new minter already exist", async () => {
      await expect(
        tbContract.replaceMinter(
          await signers[2].getAddress(),
          await signers[2].getAddress()
        )
      ).to.be.reverted;
    });

    it("should successfully replace a minter", async () => {
      const minter = await tbContract.replaceMinter(
        await signers[2].getAddress(),
        await signers[1].getAddress()
      );

      expect(minter.hash).to.not.be.undefined;
      expect(minter.hash).to.be.a("string");
    });
  });

  describe("Test Minter Removal", async () => {
    it("should fail if caller is not contract owner", async () => {
      await expect(
        tbContract
          .connect(signers[1])
          .removeMinter(await signers[1].getAddress())
      ).to.be.reverted;
    });
    it("should fail if contract is paused", async () => {
      await tbContract.pause();
      await expect(tbContract.removeMinter(await signers[1].getAddress())).to.be
        .reverted;
    });
    it("should fail if new minter address is invalid", async () => {
      await tbContract.resume();
      await expect(tbContract.removeMinter(invalidAddress)).to.be.reverted;
    });
    it("should fail if minter is tight to a mint", async () => {
      await tbContract
        .connect(signers[1])
        .mint(1775147997, 10, 3, 100000, true, "CMR Bond");
      await expect(tbContract.removeMinter(await signers[1].getAddress())).to.be
        .reverted;
    });
    it("should successfully remove a minter", async () => {
      const signerAddr = await signers[4].getAddress();
      await tbContract.addMinter(signerAddr);
      const minter = await tbContract.removeMinter(signerAddr);

      expect(minter.hash).to.not.be.undefined;
      expect(minter.hash).to.be.a("string");
    });
  });

  describe("Test Bond Minting", async () => {
    it("should fail if contract is paused", async () => {
      await tbContract.pause();
      await expect(
        tbContract
          .connect(signers[6])
          .mint(1743458951, 10, 1, 1000000, true, "CMR Bond")
      ).to.be.reverted;
    });
    it("should fail if caller is not minter", async () => {
      await tbContract.resume();
      await expect(
        tbContract
          .connect(signers[6])
          .mint(1743458951, 10, 1, 1000000, true, "CMR Bond")
      ).to.be.reverted;
    });
    it("should fail if expiration date is less than present", async () => {
      await expect(
        tbContract
          .connect(signers[1])
          .mint(1643458951, 10, 1, 1000000, true, "CMR Bond")
      ).to.be.reverted;
    });

    it("should fail if interest rate is <= 0", async () => {
      await expect(
        tbContract
          .connect(signers[1])
          .mint(1743458951, 0, 1, 1000000, true, "CMR Bond")
      ).to.be.reverted;
    });
    it("should successfully mint a token", async () => {
      await tbContract.minterExist(await signers[1].getAddress());
      const trx = await tbContract
        .connect(signers[1])
        .mint(1743458951, 10, 1, 100000, true, "CMR Bond");
      expect(trx.hash).to.not.be.undefined;
      expect(trx.hash).to.be.a("string");
    });
    it("should fail if token id already exist", async () => {
      await expect(
        tbContract
          .connect(signers[1])
          .mint(1743458951, 10, 1, 100000, true, "CMR Bond")
      ).to.be.reverted;
    });
  });

  describe("Test Token Burning", async () => {
    it("should fail if contract is paused", async () => {
      await tbContract.pause();
      await expect(tbContract.connect(signers[6]).burn(1, 1000000)).to.be
        .reverted;
    });
    it("should fail if token id doesn't exist", async () => {
      await tbContract.resume();
      await expect(tbContract.connect(signers[6]).burn(6, 1000000)).to.be
        .reverted;
    });
    it("should fail if caller is not minter", async () => {
      await expect(tbContract.connect(signers[1]).burn(1, 0)).to.be.reverted;
    });
    it("should fail if amount is greater than minter's balance", async () => {
      await expect(tbContract.connect(signers[1]).burn(1, 1000000000)).to.be
        .reverted;
    });

    it("should successfully burn a token", async () => {
      const trx = await tbContract.connect(signers[1]).burn(1, 1000);
      expect(trx.hash).to.not.be.undefined;
      expect(trx.hash).to.be.a("string");
    });
  });
  describe("Test Token Freezing", async () => {
    it("should fail if caller is not contract owner", async () => {
      await expect(tbContract.connect(signers[2]).freezeToken(1)).to.be
        .reverted;
    });

    it("should successfully freeze a token", async () => {
      const minter = await tbContract.freezeToken(1);
      expect(minter.hash).to.not.be.undefined;
      expect(minter.hash).to.be.a("string");
    });

    it("should fail if token is already frozen", async () => {
      await expect(tbContract.freezeToken(1)).to.be.reverted;
    });
  });

  describe("Test Token unFreezing", async () => {
    it("should fail if caller is not contract owner", async () => {
      await expect(tbContract.connect(signers[2]).unfreezeToken(1)).to.be
        .reverted;
    });

    it("should successfully unfreeze a token", async () => {
      const minter = await tbContract.unfreezeToken(1);
      expect(minter.hash).to.not.be.undefined;
      expect(minter.hash).to.be.a("string");
    });

    it("should fail if token is not frozen", async () => {
      await expect(tbContract.unfreezeToken(1)).to.be.reverted;
    });
  });

  describe("Test resume InterTransfer", async () => {
    it("should fail if caller is not contract owner", async () => {
      await expect(tbContract.connect(signers[2]).resumeInterTransfer(1)).to.be
        .reverted;
    });

    it("should fail if token doesn't exist", async () => {
      await expect(tbContract.resumeInterTransfer(8)).to.be.reverted;
    });

    it("should successfully InterTransfer for a token", async () => {
      const minter = await tbContract.resumeInterTransfer(1);
      expect(minter.hash).to.not.be.undefined;
      expect(minter.hash).to.be.a("string");
    });

    it("should fail if token InterTransfer is already resumed", async () => {
      await expect(tbContract.resumeInterTransfer(1)).to.be.reverted;
    });

    describe("Test resume InterTransfer After Expiry", async () => {
      it("should fail if caller is not contract owner", async () => {
        await expect(tbContract.connect(signers[2]).pauseInterTransferAfterExpiry(1)).to
          .be.reverted;
      });
    });
  });

  describe("Test pause InterTransfer", async () => {
    it("should fail if caller is not contract owner", async () => {
      await expect(tbContract.connect(signers[2]).pauseInterTransfer(1)).to.be
        .reverted;
    });

    it("should fail if token doesn't exist", async () => {
      await expect(tbContract.pauseInterTransfer(8)).to.be.reverted;
    });

    it("should successfully pause InterTransfer for a token", async () => {
      const trx = await tbContract.pauseInterTransfer(1);
      expect(trx.hash).to.not.be.undefined;
      expect(trx.hash).to.be.a("string");
    });

    it("should fail if token InterTransfer is already paused", async () => {
      await expect(tbContract.pauseInterTransfer(1)).to.be.reverted;
    });
  });
  describe("Test Operator", async () => {
    it("should revert if not removing a non Operator", async () => {
      const operators = [
        {
          action: 0,
          owner: await signers[3].getAddress(),
          tokenId: 3,
          operator: await signers[4].getAddress(),
        },
        {
          action: 1,
          owner: await signers[3].getAddress(),
          tokenId: 1,
          operator: await signers[5].getAddress(),
        },
      ];

      await expect(tbContract.connect(signers[1]).updateOperators(operators)).to.be.reverted;

    });

    it("should successfully update Operators", async () => {
      const operators = [
        {
          action: 0,
          owner: await signers[3].getAddress(),
          tokenId: 3,
          operator: await signers[4].getAddress(),
        },
        {
          action: 0,
          owner: await signers[3].getAddress(),
          tokenId: 1,
          operator: await signers[5].getAddress(),
        },
      ];
      await tbContract.connect(signers[1]).updateOperators(operators);
    });

    it("should revert if adding an existing Operator", async () => {
      const operators = [
        {
          action: 0,
          owner: await signers[3].getAddress(),
          tokenId: 3,
          operator: await signers[4].getAddress(),
        },
        {
          action: 1,
          owner: await signers[3].getAddress(),
          tokenId: 1,
          operator: await signers[5].getAddress(),
        },
      ];

      await expect(tbContract.connect(signers[1]).updateOperators(operators)).to.be.reverted;

    });

  });

  describe("Test Transfer", async () => {
    it("should fail if inter transfer is not allowed", async () => {
      const transfer = [
        {
          from: await signers[4].getAddress(),
          transferDestination: [
            {
              tokenId: 3,
              amount: 1000,
              receiver: await signers[2].getAddress(),
            }
          ],
        },
      ];

      await expect(tbContract.connect(signers[1]).makeTransfer(transfer)).to.be
        .reverted;
    });
    it("should fail if sending more than balance", async () => {
      await tbContract.resumeInterTransfer(3);
      const transfer = [
        {
          from: await signers[4].getAddress(),
          transferDestination: [
            {
              tokenId: 3,
              amount: 1000,
              receiver: await signers[2].getAddress(),
            },
            {
              tokenId: 1,
              amount: 8000,
              receiver: await signers[3].getAddress(),
            },
            {
              tokenId: 3,
              amount: 5000,
              receiver: await signers[4].getAddress(),
            },
          ],
        },
      ];

      await expect(tbContract.connect(signers[1]).makeTransfer(transfer)).to.be
        .reverted;
    });
    it("should fail if sender is still receiver", async () => {
      const transfer = [
        {
          from: await signers[1].getAddress(),
          transferDestination: [
            {
              tokenId: 3,
              amount: 1000,
              receiver: await signers[2].getAddress(),
            },
            {
              tokenId: 1,
              amount: 8000,
              receiver: await signers[1].getAddress(),
            },
          ],
        },
      ];

      await expect(tbContract.connect(signers[1]).makeTransfer(transfer)).to.be
        .reverted;
    });
    it("should Transfer(DEPOSIT) successfully", async () => {
      const deposit = [
        {
          tokenId: 3,
          amount: 1000,
          receiver: await signers[2].getAddress(),
        },
        {
          tokenId: 3,
          amount: 8000,
          receiver: await signers[3].getAddress(),
        },
        {
          tokenId: 3,
          amount: 5000,
          receiver: await signers[4].getAddress(),
        },
      ];
      

      const transfers = [
        {
          from: await signers[1].getAddress(),
          transferDestination: deposit
        }
      ];



      // Store balances before the transfer
      const balancesBefore = {};
      const totalAmounts = {};
      for (const t of transfers) {
          const from = t.from;
          balancesBefore[from] = balancesBefore[from] || {};
          totalAmounts[from] = totalAmounts[from] || {};

          for (const dest of t.transferDestination) {
              const receiver = dest.receiver;
              const tokenId = dest.tokenId;
              const amount = dest.amount;

              // Store balance of 'from' address before the transfer
              balancesBefore[from][tokenId] = balancesBefore[from][tokenId] || (await tbContract.balanceOf(from, tokenId));
              // Store balance of 'receiver' address before the transfer
              balancesBefore[receiver] = balancesBefore[receiver] || {};
              balancesBefore[receiver][tokenId] = balancesBefore[receiver][tokenId] || (await tbContract.balanceOf(receiver, tokenId));
              // Store total amount sent 'from' to 'receiver'
              totalAmounts[from][tokenId] = (totalAmounts[from][tokenId] || BigInt(0)) + BigInt(amount);
            }
        }

      const trx = await tbContract.connect(signers[1]).makeTransfer(transfers);
       const receipt = await trx.wait();
       // Verify transfer logs
       for (const log of receipt.logs) {
        const event = tbContract.interface.parseLog(log);

        if (event.name === "Transfer") {
            const { caller, sender, receiver, id, amount } = event.args;

            // Check that sender is not equal to receiver
            expect(sender).to.not.equal(receiver);

            // Check balance changes
            const senderBalance = await tbContract.balanceOf(sender, id);
            const receiverBalance = await tbContract.balanceOf(receiver, id);

            console.log(`Token Idd: ${id}, Amount: ${amount},Sender: ${sender}, Sender Balance: ${senderBalance}, Receiver: ${receiver}, Receiver Balance: ${receiverBalance}`);
              // Balance of 'sender' should decrease by the total amount sent
            expect(senderBalance).to.equal(balancesBefore[sender][id] - totalAmounts[sender][id]);
            // Balance of 'receiver' should increase by the respective amount in each transfer
            expect(receiverBalance).to.equal(balancesBefore[receiver][id] + amount);
        }
    }

       
      });


    it("should Transfer(WITHDRAW) successfully", async () => {

      const withdraw = [
        {
          tokenId: 3,
          amount: 4000,
          receiver: await signers[1].getAddress(),
        }
      ];

      const withdraw_2 = [
        {
          tokenId: 3,
          amount: 6000,
          receiver: await signers[1].getAddress(),
        }
      ];
      const transfers = [
        {
          from: await signers[4].getAddress(),
          transferDestination: withdraw
        },
        {
          from: await signers[3].getAddress(),
          transferDestination: withdraw_2
        }
      ];



      // Store balances before the transfer
      const balancesBefore = {};
      const totalAmounts = {};
      for (const t of transfers) {
          const from = t.from;
          balancesBefore[from] = balancesBefore[from] || {};
          totalAmounts[from] = totalAmounts[from] || {};

          for (const dest of t.transferDestination) {
              const receiver = dest.receiver;
              const tokenId = dest.tokenId;
              const amount = dest.amount;

              // Store balance of 'from' address before the transfer
              balancesBefore[from][tokenId] = balancesBefore[from][tokenId] || (await tbContract.balanceOf(from, tokenId));
              // Store balance of 'receiver' address before the transfer
              balancesBefore[receiver] = balancesBefore[receiver] || {};
              totalAmounts[receiver] = totalAmounts[receiver] || {};
              balancesBefore[receiver][tokenId] = balancesBefore[receiver][tokenId] || (await tbContract.balanceOf(receiver, tokenId));
              // Store total amount sent 'from' to 'receiver'
              totalAmounts[from][tokenId] = (totalAmounts[from][tokenId] || BigInt(0)) + BigInt(amount);
              totalAmounts[receiver][tokenId] = (totalAmounts[receiver][tokenId] || BigInt(0)) + BigInt(amount);

          }
      }

      const trx = await tbContract.connect(signers[1]).makeTransfer(transfers);
       const receipt = await trx.wait();
       for (const log of receipt.logs) {
        const event = tbContract.interface.parseLog(log);

        if (event.name === "Transfer") {
            const { caller, sender, receiver, id, amount } = event.args;

            // Check that sender is not equal to receiver
            expect(sender).to.not.equal(receiver);

            // Check balance changes
            const senderBalance = await tbContract.balanceOf(sender, id);
            const receiverBalance = await tbContract.balanceOf(receiver, id);

            console.log(`Token Idd: ${id}, Amount: ${amount},Sender: ${sender}, Sender Balance: ${senderBalance}, Receiver: ${receiver}, Receiver Balance: ${receiverBalance}`);

              // Balance of 'sender' should decrease by the total amount sent
            expect(senderBalance).to.equal(balancesBefore[sender][id] - totalAmounts[sender][id]);
            // Balance of 'receiver' should increase by the total amount received
            expect(receiverBalance).to.equal(balancesBefore[receiver][id] + totalAmounts[receiver][id]);
        }
    }

       
      });
  });
});
