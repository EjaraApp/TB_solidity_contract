// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./ERC-6909.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TBImpl is Ownable(msg.sender), ERC6909 {
    event MinterReplaced(
        uint tokenId,
        address indexed oldMinter,
        address indexed newMinter
    );
    event MinterRemoved(address indexed newMinter);
    event TokenInterTransferAllowed(uint tokenId, bool isTransferable);
    event TokenItrAfterExpiryAllowed(uint tokenId, bool isTransferable);
    event TokenInterTransfered(
        address indexed sender,
        address indexed receiver,
        uint amount
    );

    uint public constant unitPrice = 1000;
    bool public isContractPaused;

    enum Status {
        DEPOSIT,
        WITHDRAW
    }

    struct DepositWithdrawal {
        uint amountSent;
        uint timestamp;
        address senderAddress;
        address receiverAddress;
        Status status;
    }

    struct TransferParam {
        uint tokenId;
        uint amount;
        address sender;
        address receiver;
    }

    struct TransferDest {
        uint tokenId;
        uint amount;
        address receiver;
    }

    struct Token {
        uint expirationDate;
        uint32 interestRate;
        address minter;
        bool minterIsOperator;
        bool tokenFrozen;
        bool tokenItrPaused;
        bool tokenItrExpiryPaused;
        string _name;
    }

    enum OperatorAction {
        Add,
        Remove
    }

    struct OperatorParam {
        OperatorAction action;
        address owner;
        uint tokenId;
        address operator;
    }

    mapping(uint => Token) public TokenMetadata;
    mapping(uint => DepositWithdrawal[]) public Transfers;
    mapping(address => uint[]) public minterTokensMetadata;

    modifier notMatured(uint _tokenId) {
        require(
            block.timestamp < TokenMetadata[_tokenId].expirationDate,
            "token is mature"
        );
        _;
    }

    modifier tokenExist(uint _tokenId) {
        require(
            TokenMetadata[_tokenId].expirationDate != 0,
            "Token does not exist"
        );
        _;
    }

    modifier isInputListValid(uint _length) {
        require(_length <= 15, "List should not be above 15");
        _;
    }

    //----------------------------------------------------------------------------
    // Contract execution pause/resume
    //----------------------------------------------------------------------------

    //Pause contract execution
    function pause() external onlyOwner {
        require(!isContractPaused, "contract is already paused");
        isContractPaused = true;
    }

    //Resume contract execution
    function resume() external onlyOwner {
        require(isContractPaused, "contract is already resumed");
        isContractPaused = false;
    }

    modifier notPausedContract() {
        require(!isContractPaused, "Contract is paused");
        _;
    }

    //----------------------------------------------------------------
    // INTER TRANSFER PAUSE AND RESUME
    //----------------------------------------------------------------
    // permit users to transfer a specific bond among themselves
    function resumeInterTransfer(
        uint _tokenId
    ) external onlyOwner tokenExist(_tokenId) {
        require(
            TokenMetadata[_tokenId].tokenItrPaused,
            "InterTransfer is not paused"
        );
        TokenMetadata[_tokenId].tokenItrPaused = false;
        emit TokenInterTransferAllowed(
            _tokenId,
            TokenMetadata[_tokenId].tokenItrPaused
        );
    }

    // prevent users from transfering a specific bond among themselves
    function pauseInterTransfer(
        uint _tokenId
    ) external onlyOwner tokenExist(_tokenId) {
        require(
            !TokenMetadata[_tokenId].tokenItrPaused,
            "InterTransfer is already paused"
        );
        TokenMetadata[_tokenId].tokenItrPaused = true;
        emit TokenInterTransferAllowed(
            _tokenId,
            TokenMetadata[_tokenId].tokenItrPaused
        );
    }

    function _interTransferAllowed(
        uint _tokenId,
        address _sender,
        address _receiver
    ) internal view returns (bool) {
        if (!TokenMetadata[_tokenId].tokenItrPaused) {
            return true;
        } else if (
            TokenMetadata[_tokenId].minter == _sender ||
            TokenMetadata[_tokenId].minter == _receiver
        ) {
            return true;
        } else {
            return false;
        }
    }

    //----------------------------------------------------------------
    // INTER TRANSFER AFTER EXPIRY PAUSE AND RESUME
    //----------------------------------------------------------------

    function resumeItrAfterExpiry(
        uint _tokenId
    ) external onlyOwner tokenExist(_tokenId) {
        require(
            TokenMetadata[_tokenId].tokenItrExpiryPaused,
            "InterTransfer after expiry is not paused"
        );
        TokenMetadata[_tokenId].tokenItrExpiryPaused = false;
        emit TokenItrAfterExpiryAllowed(
            _tokenId,
            TokenMetadata[_tokenId].tokenItrExpiryPaused
        );
    }

    function pauseItrAfterExpiry(
        uint _tokenId
    ) external onlyOwner tokenExist(_tokenId) {
        require(
            !TokenMetadata[_tokenId].tokenItrExpiryPaused,
            "InterTransfer after expiry is already paused"
        );
        TokenMetadata[_tokenId].tokenItrExpiryPaused = true;
        emit TokenItrAfterExpiryAllowed(
            _tokenId,
            TokenMetadata[_tokenId].tokenItrExpiryPaused
        );
    }

    function _isInterTransferAfterExpiryAllowed(
        uint _tokenId,
        address _receiver
    ) internal view returns (bool) {
        if (!TokenMetadata[_tokenId].tokenItrExpiryPaused) {
            return true;
        } else if (
            TokenMetadata[_tokenId].expirationDate > block.timestamp ||
            TokenMetadata[_tokenId].minter == _receiver
        ) {
            return true;
        } else {
            return false;
        }
    }

    //----------------------------------------------------------------
    // MINTER IS OPERATOR
    //----------------------------------------------------------------
    function setMinterAsOperator(uint _tokenId) external onlyOwner tokenExist(_tokenId){
        require(
            !TokenMetadata[_tokenId].minterIsOperator,
            "Minter is already operator"
        );
        TokenMetadata[_tokenId].minterIsOperator = true;
    }

    function unsetMinterAsOperator(uint _tokenId) external onlyOwner tokenExist(_tokenId){
        require(
            TokenMetadata[_tokenId].minterIsOperator,
            "Minter is not operator"
        );
        TokenMetadata[_tokenId].minterIsOperator = false;
    }

    //----------------------------------------------------------------
    // FREEZE TRANSFER OF TOKEN
    //----------------------------------------------------------------
    function freezeToken(uint _tokenId) external onlyOwner tokenExist(_tokenId){
        require(!TokenMetadata[_tokenId].tokenFrozen, "Token already frozen");
        TokenMetadata[_tokenId].tokenFrozen = true;
    }

    function unfreezeToken(uint _tokenId) external onlyOwner tokenExist(_tokenId){
        require(TokenMetadata[_tokenId].tokenFrozen, "Token not frozen");
        TokenMetadata[_tokenId].tokenFrozen = false;
    }

    modifier isNotFrozenToken(uint _tokenId) {
        require(!TokenMetadata[_tokenId].tokenFrozen, "Token is frozen");
        _;
    }

    //----------------------------------------------------------------------------
    // Minter role
    //----------------------------------------------------------------------------

    function addMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "Address is invalid");
        minterTokensMetadata[_minter] = [];
    }

    function replaceMinter(
        address _OldMinter,
        address _newMinter
    ) public onlyOwner notPausedContract {
        require(_newMinter != address(0), "Address is invalid");
        require(
            minterTokensMetadata[_OldMinter].length > 0,
            "Old minter does not exist"
        );
        require(
            minterTokensMetadata[_newMinter].length == 0,
            "New minter exist"
        );
        // replace old minter with new minter in all minted tokens
        for (uint i = 0; i < minterTokensMetadata[_OldMinter].length; i++) {
            uint tokenId = minterTokensMetadata[_OldMinter][i];
            
            // mint previous minter balance to new minter and burn previous minter balance
            _mint(_newMinter, tokenId, balanceOf[_OldMinter][tokenId]);
            _burn(_OldMinter, tokenId, balanceOf[_OldMinter][tokenId]);
            //add  new minter with respective tokens
            minterTokensMetadata[_newMinter].push(tokenId);
            TokenMetadata[tokenId].minter = _newMinter;
            emit MinterReplaced(tokenId, _OldMinter, _newMinter);
        }
        //remove OldMinter
        delete minterTokensMetadata[_OldMinter];
    }

    function removeMinter(
        address _minter
    ) external onlyOwner notPausedContract isMinter(_minter){
        require(_minter != address(0), "Address is invalid");
        //cannot remove minter if tight to a token
        require(
            minterTokensMetadata[_minter].length < 1,
            "Cannot remove minter"
        );
        delete minterTokensMetadata[_minter];
        emit MinterRemoved(_minter);
    }

    function _isTokenMinter(
        uint _tokenId,
        address _minter
    ) internal view isMinter(_minter) returns (bool) {
        if (TokenMetadata[_tokenId].minter == _minter) {
            return true;
        } else {
            return false;
        }
    }

    modifier isMinter(address _minter) {
        require(
            minterTokensMetadata[_minter].length > 0,
            "Minter does not exist"
        );
        _;
    }

    //----------------------------------------------------------------------------
    // Operators
    //----------------------------------------------------------------------------

    // handle both additions and removals of operators for specific tokens
    function updateOperators(
        OperatorParam[] memory upl
    ) public notPausedContract isInputListValid(upl.length){
        for (uint i = 0; i < upl.length; i++) {
            OperatorParam memory param = upl[i];
            //if action is ADD, check if owner is caller and add operator
            if (param.action == OperatorAction.Add) {
                require(param.owner == msg.sender, "Caller not owner");
                setOperator(param.operator, true);
            } 
            //if action is REMOVE, check if owner is caller and operator exist, then delete operator
            else {

                if (
                    param.owner == msg.sender &&
                    operator[param.owner][param.tokenId] == param.operator
                ) {
                    setOperator(param.operator, false);
                }
            }
        }
    }

    // check if the minter is an operator for a token
    function minterIsOperator(
        uint _tokenId,
        address _sender
    ) public view returns (bool) {
        return
            TokenMetadata[_tokenId].minterIsOperator &&
            _sender == TokenMetadata[_tokenId].minter;
    }

    // check ownership and operator permissions for a  transfer
     function checkOwnerAndOperators((address, TransferDest[])[] calldata _transfers) public view returns (bool) {
        for (uint i = 0; i < _transfers.length; i++) {
            address sender = _transfer.sender;
            uint tokenId = _transfer.tokenId;
            //if caller is not sender, check if caller is operator or minter
            if (msg.sender != sender) {
                if (
                    (operator[msg.sender][tokenId] == sender ||
                        _isOperatorForAll(sender)) ||
                    minterIsOperator(tokenId, msg.sender)
                ) {
                    return true;
                }
            } else if(msg.sender == sender && balanceOf[msg.sender][tokenId]>0){
            return true;
        }    
        }
        return false;
    }

    //----------------------------------------------------------------------------
    // Mint & burn
    //----------------------------------------------------------------------------

    function mint(
        uint _expirationDate,
        uint32 _interestRate,
        uint _tokenId,
        uint _amount,
        bool _custodial,
        string memory _name
    ) external notPausedContract isMinter(msg.sender) {
        require(
            TokenMetadata[_tokenId].minter == address(0),
            "Token already exist"
        );
        require(
            _expirationDate > block.timestamp,
            "Expiration date must be above current time"
        );
        require(
            _amount >= unitPrice && _amount % unitPrice == 0,
            "Amount must be in multiples of unit price"
        );
        require(_interestRate > 0, "Interest rate cannot be 0");
        TokenMetadata[_tokenId] = Token(
            _expirationDate,
            _interestRate,
            msg.sender,
            _custodial,
            false,
            _custodial,
            true,
            _name
        );
        // mint to the  minter address
        _mint(msg.sender, _tokenId, _amount);
        // add token to minters token lists
        minterTokensMetadata[msg.sender].push(minterToken(_amount, _tokenId));
    }

    function burn(uint _tokenId, uint _amount) external notPausedContract tokenExist(_tokenId){
        require(_isTokenMinter(_tokenId, msg.sender), "Not token minter");
        uint balance = balanceOf[msg.sender][_tokenId];
        require(balance > _amount, "Amount must be less than balance");
        require(_amount > 0, "Amount cannot be less than 0");
        if (balance > _amount) {
            _burn(msg.sender, _tokenId, _amount);
        }
        else {
            revert("Insufficient balance");
        }
        emit TokenBurned(_tokenId, _amount);
    }

    function makeTransfer(
        (address, TransferDest[])[] calldata _transfers
    ) external notPausedContract isInputListValid(_transfers.length) { // refer https://github.com/EjaraApp/tokenized-contract/blob/c8c540ce3ff616047456c6bbf79306f610df54f1/contract/tokenized-bond.arl#L469
        require(checkOwnerAndOperators(_transfers), "Not operator or owner");
        for (uint i = 0; i < _transfers.length; i++) {
            uint tokenId = _transfers[i].tokenId;
            uint amount = _transfers[i].amount;
            address sender = _transfers[i].sender;
            address receiver = _transfers[i].receiver;

            require(
                _interTransferAllowed(tokenId, sender, receiver),
                "Inter transfer not allowed"
            );
            require(
                _isInterTransferAfterExpiryAllowed(tokenId, receiver),
                "Inter transfer after expiry not allowed"
            );
            require(
                sender != receiver,
                "Sender must be different from receiver"
            );

            require(
                amount >= unitPrice && amount % unitPrice == 0,
                "Amount must be in multiples of unit price"
            );
            require(
                balanceOf[sender][tokenId] >= amount,
                "Insufficient balance"
            );
            require(transfer(_receiver, _tokenId, _amount), "Transfer failed");
            
        }
    }
}
