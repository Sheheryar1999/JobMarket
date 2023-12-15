// src/App.jsx
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import MarketContract from './contractJson/Market.json';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [openJobs, setOpenJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [newJobName, setNewJobName] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [newJobAmount, setNewJobAmount] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        // Connect to MetaMask or other Ethereum provider
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
    
        // Request account access if needed (modern DApp browsers)
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccounts(accounts);
            setSelectedAccount(accounts[0]);
          } else {
            console.log('Please connect to MetaMask.');
          }
        } else {
          console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    
        // Load the smart contract
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = MarketContract.networks[networkId];
        
        if (deployedNetwork) {
          const instance = new web3Instance.eth.Contract(
            MarketContract.abi,
            deployedNetwork.address
          );
          setContract(instance);
    
          // Load open jobs from the smart contract
          const openJobCount = await instance.methods.openJobCounter().call();
          const openJobList = [];
          for (let i = 1; i <= openJobCount; i++) {
            const job = await instance.methods.openJobs(i).call();
            openJobList.push(job);
          }
          setOpenJobs(openJobList);
    
          // Load all jobs from the smart contract
          const allJobCount = await instance.methods.jobCounter().call();
          const allJobList = [];
          for (let i = 1; i <= allJobCount; i++) {
            const job = await instance.methods.jobs(i).call();
            allJobList.push(job);
          }
          setAllJobs(allJobList);
        } else {
          console.error('Contract deployment information not found for networkId:', networkId);
        }
      } catch (error) {
        console.error('Error loading web3, accounts, or contract', error);
      }
    };
    
    init();
  }, []);

  const handleConnectAccount = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccounts(accounts);
      setSelectedAccount(accounts[0]);

      // Reload contract and job lists with the new account
      const updatedContract = new web3.eth.Contract(
        MarketContract.abi,
        contract._address
      );
      setContract(updatedContract);
      refreshJobLists();
    } catch (error) {
      console.error('Error connecting account', error);
    }
  };

  const handleCreateJob = async () => {
    try {
      if (contract) {
        await contract.methods
          .createJob(newJobName, newJobDescription, web3.utils.toWei(newJobAmount, 'ether'))
          .send({ from: selectedAccount });
  
        refreshJobLists();
        clearJobInputs();
      } else {
        console.error('Contract not initialized.');
      }
    } catch (error) {
      console.error('Error creating a job', error);
    }
  };
  

  const handleAcceptJob = async (jobId) => {
    try {
      await contract.methods.acceptJob(jobId).send({ from: selectedAccount });
      refreshJobLists();
    } catch (error) {
      console.error('Error accepting a job', error);
    }
  };

  const handleCompleteJob = async (jobId) => {
    try {
      await contract.methods.completeJob(jobId).send({ from: selectedAccount });
      refreshJobLists();
    } catch (error) {
      console.error('Error completing a job', error);
    }
  };

  const handleDisputeJob = async (jobId) => {
    try {
      await contract.methods.disputeJob(jobId).send({ from: selectedAccount });
      refreshJobLists();
    } catch (error) {
      console.error('Error disputing a job', error);
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      await contract.methods.closeJob(jobId).send({ from: selectedAccount });
      refreshJobLists();
    } catch (error) {
      console.error('Error closing a job', error);
    }
  };

  const handleShowAllJobs = async () => {
    try {
      const jobDetails = await contract.methods.getAllJobDetails().call({ from: selectedAccount });
      console.log('All Jobs:', jobDetails);
    } catch (error) {
      console.error('Error showing all jobs', error);
    }
  };

  const handleShowOpenJobs = async () => {
    try {
      const openJobDetails = await contract.methods.getAllOpenJobDetails().call({ from: selectedAccount });
      console.log('Open Jobs:', openJobDetails);
    } catch (error) {
      console.error('Error showing open jobs', error);
    }
  };

  const handleShowJobDetails = async (jobId) => {
    try {
      const jobDetails = await contract.methods.jobs(jobId).call({ from: selectedAccount });
      setSelectedJob(jobDetails);
      console.log('Selected Job Details:', jobDetails);
    } catch (error) {
      console.error('Error showing job details', error);
    }
  };

  const refreshJobLists = async () => {
    const openJobCount = await contract.methods.openJobCounter().call();
    const openJobList = [];
    for (let i = 1; i <= openJobCount; i++) {
      const job = await contract.methods.openJobs(i).call();
      openJobList.push(job);
    }
    setOpenJobs(openJobList);

    const allJobCount = await contract.methods.jobCounter().call();
    const allJobList = [];
    for (let i = 1; i <= allJobCount; i++) {
      const job = await contract.methods.jobs(i).call();
      allJobList.push(job);
    }
    setAllJobs(allJobList);
  };

  const clearJobInputs = () => {
    setNewJobName('');
    setNewJobDescription('');
    setNewJobAmount('');
  };

  return (
    <div className="container mt-5">
      <h1>Freelance Marketplace</h1>
      <p>Connected Account: {selectedAccount}</p>
      {!selectedAccount && (
        <button onClick={handleConnectAccount} className="btn btn-primary">
          Connect Account
        </button>
      )}

      {/* Create Job Section */}
      {selectedAccount && (
        <div>
          <h2>Create Job</h2>
          <div className="mb-3">
            <label htmlFor="newJobName" className="form-label">
              Job Name
            </label>
            <input
              type="text"
              className="form-control"
              id="newJobName"
              value={newJobName}
              onChange={(e) => setNewJobName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="newJobDescription" className="form-label">
              Job Description
            </label>
            <textarea
              className="form-control"
              id="newJobDescription"
              value={newJobDescription}
              onChange={(e) => setNewJobDescription(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="newJobAmount" className="form-label">
              Job Amount (ETH)
            </label>
            <input
              type="number"
              className="form-control"
              id="newJobAmount"
              value={newJobAmount}
              onChange={(e) => setNewJobAmount(e.target.value)}
            />
          </div>
          <button onClick={handleCreateJob} className="btn btn-primary">
            Create Job
          </button>
        </div>
      )}

      {/* Display Jobs Section */}
      {selectedAccount && (
        <div className="mb-5">
          <h2>Show Jobs</h2>
          <div>
            <button onClick={handleShowAllJobs} className="btn btn-primary">
              All Jobs
            </button>
            <button onClick={handleShowOpenJobs} className="btn btn-success">
              Open Jobs
            </button>
          </div>
          {/* ... (unchanged JSX for Open Jobs and All Jobs sections) */}
        </div>
      )}

      {/* ... (unchanged JSX for Open Jobs and All Jobs sections) */}

      <div>
        <h2>Selected Job Details</h2>
        {selectedJob && (
          <div>
            <p>Name: {selectedJob.name}</p>
            <p>Description: {selectedJob.description}</p>
            <p>Amount: {web3.utils.fromWei(selectedJob.amount, 'ether')} ETH</p>
            <p>Status: {selectedJob.status}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
