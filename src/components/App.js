import React, { useEffect, useState } from "react";
import Web3 from "web3";
import Ballot from "../abis/Ballot.json";

import "./App.css";
const loadWeb3 = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
  }
};
const loadAccs = async () => {
  let web3 = window.web3;
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
};

const App = (props) => {
  const [account, setAccount] = useState("0x0");
  const [ballotData, setBallotData] = useState({});
  const [ballotHold, setBallotHold] = useState("0");
  const [accountVoterId, setAccountVoterId] = useState("XX");
  const [candidate, setCandidate] = useState([]);
  const [beCandidateName, setBeCandidateName] = useState("");

  const fetchBlockChain = async () => {
    const accountData = await loadAccs();
    setAccount(accountData);
    let web3 = window.web3;
    const networkId = await web3.eth.net.getId();
    console.log(networkId);
    const _ballotData = Ballot.networks[networkId];
    if (_ballotData) {
      const ballot = new web3.eth.Contract(Ballot.abi, _ballotData.address);
      setBallotData(ballot);
      setAccountVoterId(
        (await ballot.methods.voterId(accountData).call()).toString()
      );
      setBallotHold(
        (await ballot.methods.balanceOf(accountData).call()).toString()
      );
      // Fetch candidate
      const candidateLength = await ballot.methods.candidateLength().call();
      let _candidateAddress = [];
      for (let i = 0; i < candidateLength; i++) {
        _candidateAddress.push(ballot.methods.getCandidate(i).call());
      }
      const candidateAddress = await Promise.all(_candidateAddress);
      const candidateName = await Promise.all(
        candidateAddress.map((address) =>
          ballot.methods.candidateName(address).call()
        )
      );
      const candidateVotes = await Promise.all(
        candidateAddress.map((address) =>
          ballot.methods.balanceOf(address).call()
        )
      );
      setCandidate(
        candidateName.map((name, i) => {
          return {
            name: name.toString(),
            addr: candidateAddress[i].toString(),
            votes: candidateVotes[i].toString(),
          };
        })
      );
    } else {
      console.error("Ballot is not deployed");
    }
  };

  useEffect(() => {
    (async () => {
      await loadWeb3();
      await fetchBlockChain();
    })();
  }, []);
  return (
    <div>
      <div className="container-fluid mt-5">
        <div className="row">
          <div className="ml-auto mr-auto" style={{ maxWidth: "600px" }}>
            <div className="content mr-auto ml-auto">
              <a
                href="http://www.dappuniversity.com/bootcamp"
                target="_blank"
                rel="noopener noreferrer"
              ></a>

              <div className="grid grid-cols-2 mt-56">
                <div className="col-span-2 flex justify-between bg-indigo-600">
                  <div className="p-1 text-xs font-bold text-white">
                    {accountVoterId == ""
                      ? "This addr didn't have voterId yet"
                      : accountVoterId}
                  </div>
                  <div className="p-1 text-xs text-white">{account}</div>
                </div>
                <div className="font-bold">Ballot</div>
                <div className="font-bold">Candidate</div>

                <div className="text-sm">{ballotHold}</div>

                <div className="text-sm flex flex-col">
                  <div className="-mt-1">
                    {candidate.map(({ name, addr, votes }) => (
                      <>
                        <div className="rounded border  mt-2 flex justify-between">
                          <div className="text-sm p-1">{name}</div>
                          <div className="flex">
                            <div className="text-sm text-indigo-500 font-bold border-l p-1 pl-2 mr-1">
                              {votes}
                            </div>
                            <div
                              className={`text-sm text-red-500 font-bold border-l p-1 pl-2 mr-1  ${
                                ballotHold > 0 ? "cursor-pointer" : ""
                              }`}
                              onClick={async () => {
                                await ballotData.methods
                                  .vote(addr)
                                  .send({ from: account });
                                await fetchBlockChain();
                              }}
                            >
                              X
                            </div>
                          </div>
                        </div>
                        <div className="text-xxs">{addr}</div>
                      </>
                    ))}
                  </div>

                  <div className="flex mt-3">
                    <input
                      type="text"
                      className="border border-indigo-600 w-48 text-xs"
                      onChange={(e) => setBeCandidateName(e.target.value)}
                      value={beCandidateName}
                      placeholder="NAME"
                    />
                    <div
                      className="bg-indigo-600 text-white rounded p-1 ml-1 text-xs"
                      onClick={async () => {
                        console.log(
                          await ballotData.methods
                            .beCandidate(beCandidateName)
                            .send({ from: account })
                        );
                        await fetchBlockChain();
                      }}
                    >
                      BE CANDIDATE
                    </div>
                  </div>
                </div>

                {/* <div className="text-sm flex">
                  <div className="bg-indigo-600 text-white rounded p-1">
                    APPROVE
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="text-sm flex">
                  <input
                    type="text"
                    className="border border-indigo-600 w-24"
                    onChange={(e) => setStakingAmount(e.target.value)}
                    value={stakingAmount}
                  />
                  <div className="bg-indigo-600 text-white rounded p-1 ml-1">
                    STAKE
                  </div>
                </div> */}
    </div>
  );
};

export default App;
