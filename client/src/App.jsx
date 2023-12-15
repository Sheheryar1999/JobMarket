import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import FreelanceMarketplaceContract from './contracts/FreelanceMarketplace.json';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [jobs, setJobs] = useState([]);

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
        const deployedNetwork = FreelanceMarketplaceContract.networks[networkId];
        const instance = new web3Instance.eth.Contract(
          FreelanceMarketplaceContract.abi,
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

  return (
    <div className="container mt-5">
      <h1>Freelance Marketplace</h1>
      <p>Connected Account: {accounts[0]}</p>

      <h2>Open Jobs</h2>
      <ul>
        {jobs
          .filter((job) => job.status === '0') // '0' represents JobStatus.Open
          .map((job) => (
            <li key={job.jobId}>
              {job.name} - {job.description} - ${job.amount}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default App;
