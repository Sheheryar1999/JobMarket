// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Market {
    // State variables
    address public owner;
    enum JobStatus { Open, InProgress, Completed, Disputed, Closed }
    uint256 public jobCounter;
    mapping(uint256 => Job) public jobs;

    // Struct to represent a job
    struct Job {
        uint256 jobId;
        address client;
        address freelancer;
        string name;
        string description;
        uint256 amount;
        JobStatus status;
    }

    // Events for logging
    event JobCreated(uint256 jobId, address indexed client, string name, string description, uint256 amount);
    event JobAccepted(uint256 jobId, address indexed freelancer);
    event JobCompleted(uint256 jobId, address indexed freelancer);
    event JobDisputed(uint256 jobId);
    event JobClosed(uint256 jobId);

    // Modifiers for access control
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier onlyClient(uint256 _jobId) {
        require(msg.sender == jobs[_jobId].client, "Only the client can call this function");
        _;
    }

    modifier onlyFreelancer(uint256 _jobId) {
        require(msg.sender == jobs[_jobId].freelancer, "Only the freelancer can call this function");
        _;
    }

    modifier jobExists(uint256 _jobId) {
        require(_jobId <= jobCounter, "Job does not exist");
        _;
    }

    // Constructor to set the owner of the contract
    constructor() {
        owner = msg.sender;
    }

    // Function to create a new job
    function createJob(string memory _name, string memory _description, uint256 _amount) external {
        jobCounter++;
        jobs[jobCounter] = Job({
            jobId: jobCounter,
            client: msg.sender,
            freelancer: address(0),
            name: _name,
            description: _description,
            amount: _amount,
            status: JobStatus.Open
        });

        emit JobCreated(jobCounter, msg.sender, _name, _description, _amount);
    }

    // Function for a freelancer to accept a job
    function acceptJob(uint256 _jobId) external jobExists(_jobId) {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Open, "Job is not open for acceptance");
        job.freelancer = msg.sender;
        job.status = JobStatus.InProgress;

        emit JobAccepted(_jobId, msg.sender);
    }

    // Function for a freelancer to complete a job
    function completeJob(uint256 _jobId) external jobExists(_jobId) onlyFreelancer(_jobId) {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.InProgress, "Job is not in progress");
        job.status = JobStatus.Completed;

        // Transfer funds from escrow to the freelancer
        payable(msg.sender).transfer(job.amount);

        emit JobCompleted(_jobId, msg.sender);
    }

    // Function for a client to dispute a job
    function disputeJob(uint256 _jobId) external jobExists(_jobId) onlyClient(_jobId) {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.InProgress, "Job is not in progress");
        job.status = JobStatus.Disputed;

        emit JobDisputed(_jobId);
    }

    // Function for the owner to close a job (admin or arbitrator)
    function closeJob(uint256 _jobId) external jobExists(_jobId) onlyOwner {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Completed || job.status == JobStatus.Disputed, "Job is not completed or disputed");
        job.status = JobStatus.Closed;

        emit JobClosed(_jobId);
    }

    // Function to get information about all jobs
    function getAllJobs() external view returns (Job[] memory) {
        Job[] memory allJobs = new Job[](jobCounter);

        for (uint256 i = 1; i <= jobCounter; i++) {
            allJobs[i - 1] = jobs[i];
        }

        return allJobs;
    }
}
