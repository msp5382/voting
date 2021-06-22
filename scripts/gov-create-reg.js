const Ballot = artifacts.require("Ballot");

//Ganache Work Space AMUCK-FACE

const registry = [
  { addr: "0xF2d107ccc8456abFB64066A4FBB7D4624B8931A4", voterId: "001" },
  { addr: "0x95366f712912129542B13d5365A5603844d926E9", voterId: "002" },
  { addr: "0xcA732742F220e5613c717684F6717a7a9296daCF", voterId: "003" },
  { addr: "0x497E6edE607ba43B2B3C63E6d73D972d67ffdB65", voterId: "004" },
];

module.exports = async (callback) => {
  const ballot = await Ballot.deployed();
  await Promise.all(
    registry.map(({ addr, voterId }) => ballot.createRight(addr, voterId))
  );

  callback();
};
