const PropertyRegistryERC721 = artifacts.require("PropertyRegistryERC721");

contract("PropertyRegistryERC721", accounts => {
  let propertyRegistry;
  const owner = accounts[0];
  const propertyOwner = accounts[1];
  const testIpfsMetadata = "QmTest123456789";
  const testValuation = web3.utils.toWei("100000", "ether"); // 100,000 ETH
  const testMonthlyRent = web3.utils.toWei("1000", "ether"); // 1,000 ETH

  beforeEach(async () => {
    propertyRegistry = await PropertyRegistryERC721.new("PropertyRegistry", "PROP", { from: owner });
  });

  describe("Contract Deployment", () => {
    it("should deploy with correct name and symbol", async () => {
      const name = await propertyRegistry.name();
      const symbol = await propertyRegistry.symbol();
      
      assert.equal(name, "PropertyRegistry", "Contract name should be PropertyRegistry");
      assert.equal(symbol, "PROP", "Contract symbol should be PROP");
    });

    it("should set the deployer as owner", async () => {
      const contractOwner = await propertyRegistry.owner();
      assert.equal(contractOwner, owner, "Deployer should be the owner");
    });
  });

  describe("Property Creation", () => {
    it("should create a property and mint NFT", async () => {
      const tx = await propertyRegistry.createProperty(
        propertyOwner,
        testIpfsMetadata,
        testValuation,
        testMonthlyRent,
        { from: owner }
      );

      // Check that PropertyCreated event was emitted
      assert.equal(tx.logs.length, 1, "Should emit one event");
      assert.equal(tx.logs[0].event, "PropertyCreated", "Should emit PropertyCreated event");

      const tokenId = tx.logs[0].args.tokenId.toNumber();
      const emittedOwner = tx.logs[0].args.ownerWallet;
      
      assert.equal(tokenId, 1, "First token should have ID 1");
      assert.equal(emittedOwner, propertyOwner, "Owner should match");

      // Check that the NFT was minted to the property owner
      const nftOwner = await propertyRegistry.ownerOf(tokenId);
      assert.equal(nftOwner, propertyOwner, "NFT should be owned by property owner");

      // Check property data
      const property = await propertyRegistry.getProperty(tokenId);
      assert.equal(property.tokenId.toNumber(), tokenId, "Token ID should match");
      assert.equal(property.ownerWallet, propertyOwner, "Owner wallet should match");
      assert.equal(property.ipfsMetadata, testIpfsMetadata, "IPFS metadata should match");
      assert.equal(property.valuation.toString(), testValuation, "Valuation should match");
      assert.equal(property.monthlyRent.toString(), testMonthlyRent, "Monthly rent should match");
    });

    it("should reject property creation with zero address", async () => {
      try {
        await propertyRegistry.createProperty(
          "0x0000000000000000000000000000000000000000",
          testIpfsMetadata,
          testValuation,
          testMonthlyRent,
          { from: owner }
        );
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Invalid owner wallet"), "Should reject zero address");
      }
    });

    it("should increment token IDs correctly", async () => {
      // Create first property
      const tx1 = await propertyRegistry.createProperty(
        propertyOwner,
        testIpfsMetadata,
        testValuation,
        testMonthlyRent,
        { from: owner }
      );
      const tokenId1 = tx1.logs[0].args.tokenId.toNumber();

      // Create second property
      const tx2 = await propertyRegistry.createProperty(
        accounts[2],
        "QmTest789",
        web3.utils.toWei("200000", "ether"),
        web3.utils.toWei("2000", "ether"),
        { from: owner }
      );
      const tokenId2 = tx2.logs[0].args.tokenId.toNumber();

      assert.equal(tokenId1, 1, "First token should have ID 1");
      assert.equal(tokenId2, 2, "Second token should have ID 2");
    });
  });

  describe("Property Retrieval", () => {
    beforeEach(async () => {
      await propertyRegistry.createProperty(
        propertyOwner,
        testIpfsMetadata,
        testValuation,
        testMonthlyRent,
        { from: owner }
      );
    });

    it("should retrieve property data correctly", async () => {
      const property = await propertyRegistry.getProperty(1);
      
      assert.equal(property.tokenId.toNumber(), 1, "Token ID should be 1");
      assert.equal(property.ownerWallet, propertyOwner, "Owner wallet should match");
      assert.equal(property.ipfsMetadata, testIpfsMetadata, "IPFS metadata should match");
      assert.equal(property.valuation.toString(), testValuation, "Valuation should match");
      assert.equal(property.monthlyRent.toString(), testMonthlyRent, "Monthly rent should match");
      assert(property.createdAt.toNumber() > 0, "Created timestamp should be set");
    });

    it("should reject retrieval of non-existent property", async () => {
      try {
        await propertyRegistry.getProperty(999);
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Nonexistent token"), "Should reject non-existent token");
      }
    });
  });

  describe("Token URI", () => {
    beforeEach(async () => {
      await propertyRegistry.createProperty(
        propertyOwner,
        testIpfsMetadata,
        testValuation,
        testMonthlyRent,
        { from: owner }
      );
    });

    it("should return IPFS metadata as token URI by default", async () => {
      const tokenURI = await propertyRegistry.tokenURI(1);
      assert.equal(tokenURI, testIpfsMetadata, "Should return IPFS metadata as token URI");
    });

    it("should allow setting custom token URI", async () => {
      const customURI = "https://example.com/metadata/1.json";
      
      // Set custom token URI (only owner or token owner can do this)
      await propertyRegistry.setTokenURI(1, customURI, { from: propertyOwner });
      
      const tokenURI = await propertyRegistry.tokenURI(1);
      assert.equal(tokenURI, customURI, "Should return custom token URI");
    });

    it("should reject setting token URI by unauthorized user", async () => {
      try {
        await propertyRegistry.setTokenURI(1, "https://example.com/metadata/1.json", { from: accounts[3] });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Not authorized"), "Should reject unauthorized user");
      }
    });
  });

  describe("ERC721 Standard Functions", () => {
    beforeEach(async () => {
      await propertyRegistry.createProperty(
        propertyOwner,
        testIpfsMetadata,
        testValuation,
        testMonthlyRent,
        { from: owner }
      );
    });

    it("should track token balance correctly", async () => {
      const balance = await propertyRegistry.balanceOf(propertyOwner);
      assert.equal(balance.toNumber(), 1, "Property owner should have 1 token");

      const otherBalance = await propertyRegistry.balanceOf(accounts[2]);
      assert.equal(otherBalance.toNumber(), 0, "Other account should have 0 tokens");
    });

    it("should track total supply correctly", async () => {
      const totalSupply = await propertyRegistry.totalSupply();
      assert.equal(totalSupply.toNumber(), 1, "Total supply should be 1");

      // Create another property
      await propertyRegistry.createProperty(
        accounts[2],
        "QmTest789",
        web3.utils.toWei("200000", "ether"),
        web3.utils.toWei("2000", "ether"),
        { from: owner }
      );

      const newTotalSupply = await propertyRegistry.totalSupply();
      assert.equal(newTotalSupply.toNumber(), 2, "Total supply should be 2");
    });
  });
}); 