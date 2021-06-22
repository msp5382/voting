const { assert } = require("chai");
const Web3 = require("web3");
const Ballot = artifacts.require("Ballot");

require("chai")
  .use(require("chai-as-promised"))
  .should();
const peopleId = ["01", "02", "03", "04", "05", "06", "07", "08", "09"];
contract("Ballot", ([gov, ...people]) => {
  let ballot;
  before(async () => {
    ballot = await Ballot.new();
  });
  describe("Voting Right ", async () => {
    it("have name", async () => {
      assert.equal(await ballot.name(), "Voting Right");
    });
    it("have symbol", async () => {
      assert.equal(await ballot.symbol(), "VOTE");
    });

    it("Can create right", async () => {
      await ballot.createRight(people[0], peopleId[0], {
        from: gov,
      });
      const bal = await ballot.balanceOf(people[0]);
      assert.equal(bal.toString(), "1");
    });
    it("Non Gov Can't create right", async () => {
      await ballot.createRight(people[0], peopleId[0], {
        from: people[0],
      }).should.be.rejected;
    });
    it("Can't create more right", async () => {
      await ballot.createRight(people[0], peopleId[0], {
        from: gov,
      }).should.be.rejected;
    });

    it("Can't create right with same id", async () => {
      await ballot.createRight(people[1], peopleId[1], {
        from: gov,
      });
      await ballot.createRight(people[2], peopleId[1], {
        from: gov,
      }).should.be.rejected;
    });
    it("Can burn", async () => {
      await ballot.burnRight({
        from: people[0],
      });
      const bal1 = await ballot.balanceOf(people[0]);
      assert.equal(bal1.toString(), "0", "people0 right is not burnt");
      await ballot.burnRight({
        from: people[1],
      });
      const bal2 = await ballot.balanceOf(people[1]);
      assert.equal(bal2.toString(), "0", "people1 right is not burnt");
    });

    it("Can use to vote other people", async () => {
      // give ballot
      await Promise.all(
        people.map((person, i) =>
          ballot.createRight(person, peopleId[i], {
            from: gov,
          })
        )
      );
      const bal = await Promise.all(
        people.map((person, i) => ballot.balanceOf(person))
      );
      assert.equal(
        bal.toString(),
        people.map(() => "1"),
        "cannot give people ballot"
      );
      //Vote
      await Promise.all(
        people.map((person, i) =>
          ballot.vote(people[0], {
            from: person,
          })
        )
      );
      //Vote Result pepole0 win
      const bal2 = await Promise.all(
        people.map((person, i) => ballot.balanceOf(person))
      );
      assert.equal(
        bal2.toString(),
        people.map((person, i) => (i == 0 ? "9" : "0")),
        "people0 win"
      );
    });

    it("Anyone can be Candidate", async () => {
      await ballot.beCandidate("Prayut", {
        from: people[0],
      });
      await ballot.beCandidate("Thanatorn", {
        from: people[1],
      });

      const candidateLength = await ballot.candidateLength();
      assert.equal(candidateLength, 2);
      let _candidateAddress = [];
      for (let i = 0; i < candidateLength; i++) {
        _candidateAddress.push(ballot.getCandidate(i));
      }
      const candidateAddress = await Promise.all(_candidateAddress);
      assert.equal(
        candidateAddress.toString(),
        [people[0], people[1]].toString()
      );
      const candidateName = await Promise.all(
        candidateAddress.map((address) => ballot.candidateName(address))
      );
      assert.equal(
        candidateName.toString(),
        ["Prayut", "Thanatorn"].toString()
      );
    });
  });
});
