// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Tournament.sol";

contract TournamentFactory {
    using Clones for address;

    Tournament[] private _tournaments;
    address public tournament;

    // address public arbitrator = "0x728cba71a3723caab33ea416cb46e2cc9215a596";  //mainnet
    // address public arbitrator = address(0xDEd12537dA82C1019b3CA1714A5d58B7c5c19A04);  //kovan
    address public arbitrator = address(0x29F39dE98D750eb77b5FAfb31B2837f079FcE222); // gnosis
    // address public realitio = address(0xcB71745d032E16ec838430731282ff6c10D29Dea);  // kovan
    address public realitio = address(0xE78996A233895bE74a66F451f1019cA9734205cc);  // gnosis
    uint256 public submissionTimeout = 7 days;

    event NewTournament(address indexed tournament);
    /**
     *  @dev Constructor.
     *  @param _tournament Address of the tournament contract that is going to be used for each new deployment.
     */
    constructor(address _tournament) {
        tournament = _tournament;
    }

    function createTournament(
        Tournament.TournamentInfo memory tournamentInfo,
        uint256 closingTime,
        uint256 price,
        uint256 managementFee,
        address manager,
        Tournament.RealitioSetup memory realitioSetup,
        Tournament.RealitioQuestion[] memory questionsData,
        uint16[] memory prizeWeights
    ) public {
        Tournament instance = Tournament(payable(tournament.clone()));
        emit NewTournament(address(instance));
        instance.initialize(
            tournamentInfo, 
            realitio,
            price,
            closingTime,
            submissionTimeout,
            managementFee,
            manager,
            realitioSetup,
            questionsData, 
            prizeWeights
        );
        _tournaments.push(instance);
        
    }

    function allTournaments()
        external view
        returns (Tournament[] memory)
    {
        return _tournaments;
    }
}