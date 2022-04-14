// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@reality.eth/contracts/development/contracts/RealityETH-3.0.sol";

// If a version for mainnet was needed, gas could be saved by storing merkle hashes instead of
// all the questions and bets.

interface IERC2981 {

  // ERC165
  // royaltyInfo(uint256,uint256) => 0x2a55205a
  // IERC2981 => 0x2a55205a

  // @notice Called with the sale price to determine how much royalty
  //  is owed and to whom.
  // @param _tokenId - the NFT asset queried for royalty information
  // @param _salePrice - the sale price of the NFT asset specified by _tokenId
  // @return receiver - address of who should be sent the royalty payment
  // @return royaltyAmount - the royalty payment amount for _salePrice
  // ERC165 datum royaltyInfo(uint256,uint256) => 0x2a55205a
  function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address receiver, uint256 royaltyAmount);

}

contract Tournament is ERC721, IERC2981 {
  
    struct Result {
        uint256 tokenID;
        uint248 points;
        bool claimed;
    }

    struct BetData {
        uint256 count;
        bytes32[] predictions;
    }

    uint256 public constant DIVISOR = 10000;

    string private tournamentName;
    string private tournamentSymbol;
    string private tournamentUri;
    address public owner;
    address public manager;
    RealityETH_v3_0 public realitio; // Realitio v3
    uint256 public nextTokenID;
    bool public initialized;
    bool public tournamentInitialized;
    uint256 public resultSubmissionPeriodStart;
    uint256 public price;
    uint256 public closingTime;
    uint256 public submissionTimeout;
    uint256 public managementFee;
    uint256 private totalPrize;

    bytes32[] public questionIDs;
    uint16[] public prizeWeights;
    mapping(bytes32 => BetData) public bets; // bets[tokenHash]
    mapping(uint256 => Result) public ranking; // ranking[index]
    mapping(uint256 => bytes32) public tokenIDtoTokenHash;

    constructor() ERC721("", "") {}

    function initialize(
        string memory _tournamentName,
        string memory _tournamentSymbol,
        string memory _tournamentUri,
        address _owner,
        address _realityETH,
        uint256 _price,
        uint256 _closingTime,
        uint256 _submissionTimeout,
        uint256 _managementFee,
        address _manager
    ) external {
        require(!initialized, "Already initialized.");

        tournamentName = _tournamentName;
        tournamentSymbol = _tournamentSymbol;
        tournamentUri = _tournamentUri;
        owner = _owner;
        realitio = RealityETH_v3_0(_realityETH);
        price = _price;
        closingTime = _closingTime;
        submissionTimeout = _submissionTimeout;
        managementFee = _managementFee;
        manager = _manager;

        initialized = true;
    }

    // Link all Realitio questions.
    // Should we add a weight for each question/answer?
    function setTournament(bytes32[] calldata _questionIDs, uint16[] calldata _prizeWeights) external {
        require(msg.sender == owner, "Not authorized");
        require(!tournamentInitialized, "Already initialized");

        for (uint256 i = 0; i < _questionIDs.length; i++) {
            require(realitio.getTimeout(_questionIDs[i]) > 0, "Question not created");
        }
        questionIDs = _questionIDs;

        uint256 sumWeights;
        for (uint256 i = 0; i < _prizeWeights.length; i++) {
            sumWeights += uint256(_prizeWeights[i]);
        }
        require(sumWeights == DIVISOR, "Invalid weights");
        prizeWeights = _prizeWeights;

        tournamentInitialized = true;
    }

    function placeBet(bytes32[] calldata _results) external payable returns(uint256) {
        require(tournamentInitialized, "Not initialized");
        require(_results.length == questionIDs.length, "Results mismatch");
        require(msg.value >= price, "Not enough funds");
        require(block.timestamp < closingTime, "Bets not allowed");

        bytes32 tokenHash = keccak256(abi.encode(_results));
        tokenIDtoTokenHash[nextTokenID] = tokenHash;
        BetData storage bet = bets[tokenHash];
        if (bet.count == 0) bet.predictions = _results;
        bet.count += 1;

        _mint(msg.sender, nextTokenID);
        return nextTokenID++;
    }

    function registerAvailabilityOfResults() external {
        require(block.timestamp > closingTime, "Bets not allowed");
        require(resultSubmissionPeriodStart == 0, "Results already available");

        for (uint256 i = 0; i < questionIDs.length; i++) {
            bytes32 questionId = questionIDs[i];
            realitio.resultForOnceSettled(questionId); // Reverts if not finalized.
        }

        resultSubmissionPeriodStart = block.timestamp;
        uint256 poolBalance = address(this).balance;
        uint256 managementReward = poolBalance * managementFee / DIVISOR;
        payable(manager).send(managementReward);
        totalPrize = poolBalance - managementReward;
    }

    function reopenQuestion(
        uint256 questionIndex,
        uint256 template_id, 
        string memory question, 
        address arbitrator, 
        uint32 timeout, 
        uint32 opening_ts, 
        uint256 nonce,
        uint256 min_bond,
        address author
    ) external {
        //require parameters to calculate/check the previous questionId etc
        bytes32 content_hash = keccak256(abi.encodePacked(template_id, opening_ts, question));
        bytes32 question_id = keccak256(abi.encodePacked(content_hash, arbitrator, timeout, min_bond, address(realitio), author, nonce));

        require(question_id == questionIDs[questionIndex], "Incorrect question data");
        require(realitio.isSettledTooSoon(question_id), "Cannot reopen question");

        bytes32 reopenedQuestionID = realitio.reopenQuestion(
            template_id, 
            question, 
            arbitrator, 
            timeout, 
            opening_ts, 
            nonce + 1, 
            min_bond,
            question_id
        );
    }

    function registerPoints(uint256 _tokenID, uint256 _rankIndex) external {
        require(resultSubmissionPeriodStart != 0, "Not in submission period");
        require(block.timestamp < resultSubmissionPeriodStart + submissionTimeout, "Submission period over");
        require(_exists(_tokenID), "Token does not exist");

        bytes32[] memory predictions = bets[tokenIDtoTokenHash[_tokenID]].predictions;
        uint248 totalPoints;
        for (uint256 i = 0; i < questionIDs.length; i++) {
            bytes32 questionId = questionIDs[i];
            bytes32 result = realitio.resultForOnceSettled(questionId); // Reverts if not finalized.
            if (result == predictions[i]) {
                totalPoints += 1;
            }
        }

        if (totalPoints > ranking[_rankIndex].points && (totalPoints < ranking[_rankIndex - 1].points || _rankIndex == 0)) {
            ranking[_rankIndex].tokenID = _tokenID;
            ranking[_rankIndex].points = totalPoints;
        } else if (ranking[_rankIndex].points == totalPoints) {
            uint256 i = 1;
            while (ranking[_rankIndex + i].points == totalPoints) {
                require(ranking[_rankIndex + i].tokenID != _tokenID, "Token already registered");
                i += 1;
            }
            ranking[_rankIndex + i].tokenID = _tokenID;
            ranking[_rankIndex + i].points = totalPoints;
        }
    }

    function claimRewards(uint256 _rankIndex) external {
        require(resultSubmissionPeriodStart != 0, "Not in claim period");
        require(block.timestamp > resultSubmissionPeriodStart + submissionTimeout, "Submission period not over");
        require(!ranking[_rankIndex].claimed, "Already claimed");

        uint248 points = ranking[_rankIndex].points;
        uint256 numberOfPrizes = prizeWeights.length;
        bool rankingFound = false;
        uint256 rankingPosition = 0;

        uint256 cumWeigths = 0;
        uint256 shareBetween = 0;

        while (!rankingFound) {
            if (ranking[rankingPosition].points > points) {
                rankingPosition += 1;
            } else if (ranking[rankingPosition].points == points) {

                if (rankingPosition < numberOfPrizes) {
                    cumWeigths += prizeWeights[rankingPosition];
                }
                shareBetween += 1;
                rankingPosition += 1;
            } else {
                rankingFound = true;
            }
        }

        uint256 reward = totalPrize * cumWeigths / (DIVISOR * shareBetween);
        ranking[_rankIndex].claimed = true;
        payable(ownerOf(ranking[_rankIndex].tokenID)).send(reward);
    }

    /**
     * @dev See {IERC721Metadata-name}.
     */
    function name() public view override returns (string memory) {
        return tournamentName;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view override returns (string memory) {
        return tournamentSymbol;
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overriden in child contracts.
     */
    function _baseURI() internal view override returns (string memory) {
        return tournamentUri;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function royaltyInfo(
        uint256 ,
        uint256 _salePrice
    ) external view override(IERC2981) returns (
        address receiver,
        uint256 royaltyAmount
    ) {
        receiver = manager;
        // royalty fee = management fee
        royaltyAmount = _salePrice * managementFee / DIVISOR;
    }
    
    // For sponsors?
    receive() external payable {}
}
