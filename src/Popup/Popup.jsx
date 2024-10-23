import React, { useState, useEffect } from 'react';
import './Popup.css';

const Popup = () => {
  const [domains, setDomains] = useState('');
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    chrome.storage.sync.get(['allowedDomains'], (result) => {
      setDomains(result.allowedDomains || '');
    });
  }, []);

  const handleAddDomain = () => {
    if (newDomain) {
      addDomain(newDomain);
    }
  };

  const addDomain = (domain) => {
    const updatedDomains = domains ? `${domains},${domain}` : domain;
    chrome.storage.sync.set({ allowedDomains: updatedDomains }, () => {
      setDomains(updatedDomains);
      setNewDomain('');
    });
  };

  const handleRemoveDomain = (domainToRemove) => {
    const updatedDomains = domains
      .split(',')
      .filter(domain => domain !== domainToRemove)
      .join(',');
    chrome.storage.sync.set({ allowedDomains: updatedDomains }, () => {
      setDomains(updatedDomains);
    });
  };

  const handleAddCurrent = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = new URL(tabs[0].url);
      const hostParts = url.hostname.split('.');
      let topDomain = hostParts.slice(-2).join('.');
      if (topDomain.split('.')[0].length <= 3) {  // Check for country codes like .co.uk
        topDomain = hostParts.slice(-3).join('.');
      }
      const wildcardDomain = `*.${topDomain}`;
      if (!domains.includes(wildcardDomain)) {
        addDomain(wildcardDomain);
      }
    });
  };

  return (
    <div className="Popup">
      <div className="section">
        <div className="row">
          <span className="icon">📶</span>
          <span>Wi-Fi</span>
          <span className="secondary">Freedium-Wireless</span>
        </div>
        <div className="row">
          <span className="icon">🔵</span>
          <span>Allowed Domains</span>
          <span className="secondary">{domains.split(',').length}</span>
        </div>
        {/* Add more rows as needed */}
      </div>

      <div className="section">
        <h3>Add Domain</h3>
        <div className="input-row">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="Enter domain (e.g., example.com)"
          />
          <button onClick={handleAddDomain}>Add</button>
        </div>
        <button onClick={handleAddCurrent}>Add Current Site</button>
      </div>

      <div className="section">
        <h3>Allowed Domains:</h3>
        <ul>
          {domains.split(',').filter(Boolean).map((domain) => (
            <li key={domain}>
              {domain}
              <button onClick={() => handleRemoveDomain(domain)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Popup;
