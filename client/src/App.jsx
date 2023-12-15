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
  const [jobs, setJobs] = useState([]);
  const [newJobName, setNewJobName] = useState('');
  const [newJobDescription, setNewJobDescription] = useState('');
  const [newJobAmount, setNewJobAmount] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        // Connect to MetaMask or other Ethereum provider
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Get the current accounts
        const accounts = await web3Instance.eth.getAccounts();
        setAccounts(accounts);

        // Load the smart contract
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = MarketContract.networks[networkId];
        const instance = new web3Instance.eth.Contract(
          MarketContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(instance);

        // Load jobs from the smart contract
        const jobCount = await instance.methods.jobCounter().call();
        const jobList = [];
        for (let i = 1; i <= jobCount; i++) {
          const job = await instance.methods.jobs(i).call();
          jobList.push(job);
        }
        setJobs(jobList);
      } catch (error) {
        console.error('Error loading web3, accounts, or contract', error);
      }
    };

    init();
  }, []);

  const handleCreateJob = async () => {
    try {
      // Implement logic for creating a job
      await contract.methods.createJob(newJobName, newJobDescription, web3.utils.toWei(newJobAmount, 'ether')).send({ from: accounts[0] });

      // Refresh the job list after creating a new job
      const jobCount = await contract.methods.jobCounter().call();
      const jobList = [];
      for (let i = 1; i <= jobCount; i++) {
        const job = await contract.methods.jobs(i).call();
        jobList.push(job);
      }
      setJobs(jobList);

      // Clear input fields after creating a job
      setNewJobName('');
      setNewJobDescription('');
      setNewJobAmount('');
    } catch (error) {
      console.error('Error creating a job', error);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Freelance Marketplace</h1>
      <p>Connected Account: {accounts[0]}</p>

      {/* Create Job Section */}
      <div>
        <h2>Create Job</h2>
        <div className="mb-3">
          <label htmlFor="newJobName" className="form-label">Job Name:</label>
          <input
            type="text"
            className="form-control"
            id="newJobName"
            value={newJobName}
            onChange={(e) => setNewJobName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="newJobDescription" className="form-label">Job Description:</label>
          <textarea
            className="form-control"
            id="newJobDescription"
            rows="3"
            value={newJobDescription}
            onChange={(e) => setNewJobDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="newJobAmount" className="form-label">Job Amount (ETH):</label>
          <input
            type="number"
            className="form-control"
            id="newJobAmount"
            value={newJobAmount}
            onChange={(e) => setNewJobAmount(e.target.value)}
          />
        </div>
        <button onClick={handleCreateJob} className="btn btn-primary">Create Job</button>
      </div>

      {/* Display Jobs Section */}
      <div>
        <h2>Jobs</h2>
        <ul>
          {jobs.map((job) => (
            <li key={job.id}>
              <strong>{job.name}</strong> - {job.description} - Amount: {web3.utils.fromWei(job.amount, 'ether')} ETH
            </li>
          ))}
        </ul>
      </div>

      {/* Other sections/buttons for accepting, completing, disputing, closing jobs */}
      {/* ... */}

    </div>
  );
}

export default App;
