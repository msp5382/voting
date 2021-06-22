pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Ballot is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _rightIds;

    address public GOV;

    address[] public candidates;

    mapping(address => string) public candidateName;
    mapping(string => bool) public voterWithRight;
    mapping(address => string) public voterId;
    mapping(address => uint256) private _rightId;

    constructor() public ERC721("Voting Right", "VOTE") {
        GOV = msg.sender;
    }

    modifier onlyGov() {
        require(msg.sender == GOV, "only goverment can do this");
        _;
    }

    function createRight(address voter, string memory _voterId)
        public
        onlyGov
        returns (uint256)
    {
        require(this.balanceOf(voter) == 0, "can mint right only one time");
        require(
            voterWithRight[_voterId] != true,
            "cannot mint token with same id"
        );

        _rightIds.increment();
        uint256 rightIds = _rightIds.current();
        _safeMint(voter, rightIds);
        voterWithRight[_voterId] = true;
        voterId[voter] = _voterId;
        _rightId[voter] = rightIds;
        return rightIds;
    }

    function beCandidate(string memory name) public {
        require(
            keccak256(bytes(candidateName[msg.sender])) !=
                keccak256(bytes(name)),
            "you are candidate"
        );
        candidates.push(msg.sender);
        candidateName[msg.sender] = name;
    }

    function candidateLength() public view returns (uint256) {
        return candidates.length;
    }

    function getCandidate(uint256 i) public view returns (address) {
        return candidates[i];
    }

    function burnRight() public {
        _burn(_rightId[msg.sender]);
        voterWithRight[voterId[msg.sender]] = false;
    }

    function vote(address candidate) public {
        require(
            voterWithRight[voterId[msg.sender]] == true,
            "voter need to have right"
        );
        safeTransferFrom(msg.sender, candidate, _rightId[msg.sender]);
        voterWithRight[voterId[msg.sender]] == false;
    }
}
