const Ballot = artifacts.require("Ballot");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Ballot);
  const ballot = await Ballot.deployed();
};
