import React, { useState } from 'react'; 
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ExternalLink, FileText, Calculator, BarChart3, Users, Wallet, TrendingUp } from 'lucide-react';
import { mockProperties } from '../../data/mockData';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tokenAmount, setTokenAmount] = useState(10);
  const [activeTab, setActiveTab] = useState('overview');
  const [showVirtualTour, setShowVirtualTour] = useState(false); // Added state here

  const property = mockProperties.find(p => p.id === id);
  
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <Link to="/" className="text-emerald-600 hover:text-emerald-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const totalInvestment = tokenAmount * property.tokenPrice;
  const monthlyIncome = (tokenAmount / property.totalTokens) * property.monthlyRent;
  const annualIncome = monthlyIncome * 12;
  const yieldPercentage = (annualIncome / totalInvestment) * 100;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'calculator', label: 'Yield Calculator', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Image */}
            <div className="relative mb-4">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-96 object-cover rounded-2xl"
              />
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg">
                <span className="text-lg font-bold text-emerald-600">
                  {property.expectedYield}% Expected Yield
                </span>
              </div>
            </div>

            {/* Virtual Tour Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowVirtualTour(!showVirtualTour)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {showVirtualTour ? 'Hide Virtual Tour' : 'Take Virtual Tour'}
              </button>
            </div>

            {/* Virtual Tour iframe toggled */}
            {showVirtualTour && (
              <div
                style={{
                  width: '100%',
                  height: '600px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  marginBottom: '2rem',
                }}
              >
                <iframe
                  src="https://my.matterport.com/show/?m=1DSCmNjbKaT"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  allow="xr-spatial-tracking"
                  title="3D Property Tour"
                />
              </div>
            )}

            {/* Property Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
              <div className="flex items-center text-gray-600 mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">{property.location}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Property Value</p>
                  <p className="text-2xl font-bold text-gray-900">${property.valuation.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Token Price</p>
                  <p className="text-2xl font-bold text-gray-900">${property.tokenPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Monthly Rent</p>
                  <p className="text-2xl font-bold text-gray-900">${property.monthlyRent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Available Tokens</p>
                  <p className="text-2xl font-bold text-gray-900">{property.availableTokens.toLocaleString()}</p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">{property.description}</p>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Smart Contract</span>
                  <button className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View on Etherscan
                  </button>
                </div>
                <code className="text-sm text-gray-800 bg-white px-3 py-2 rounded border">
                  {property.contractAddress}
                </code>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-emerald-500 text-emerald-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Distribution</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Tokens Sold</span>
                          <span className="text-sm font-medium">
                            {((property.totalTokens - property.availableTokens) / property.totalTokens * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full"
                            style={{ width: `${((property.totalTokens - property.availableTokens) / property.totalTokens) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-gray-500">
                          <span>{(property.totalTokens - property.availableTokens).toLocaleString()} sold</span>
                          <span>{property.totalTokens.toLocaleString()} total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Documents</h3>
                    <div className="space-y-3">
                      {property.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                            <span className="text-gray-900">{doc}</span>
                          </div>
                          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'calculator' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Calculator</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Tokens
                        </label>
                        <input
                          type="number"
                          value={tokenAmount}
                          onChange={(e) => setTokenAmount(Number(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          min="1"
                          max={property.availableTokens}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Investment:</span>
                          <span className="font-semibold">${totalInvestment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Income:</span>
                          <span className="font-semibold text-emerald-600">${monthlyIncome.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Annual Income:</span>
                          <span className="font-semibold text-emerald-600">${annualIncome.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-gray-600">Expected Yield:</span>
                          <span className="font-bold text-emerald-600">{yieldPercentage.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Purchase Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Purchase Tokens</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Tokens
                  </label>
                  <input
                    type="number"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="1"
                    max={property.availableTokens}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Max: {property.availableTokens.toLocaleString()} tokens available
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token Price:</span>
                    <span className="font-semibold">${property.tokenPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{tokenAmount}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-gray-900 font-medium">Total Investment:</span>
                    <span className="text-xl font-bold text-gray-900">${totalInvestment.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600 mr-2" />
                    <span className="font-medium text-emerald-800">Expected Returns</span>
                  </div>
                  <div className="text-sm text-emerald-700 space-y-1">
                    <div>Monthly: ${monthlyIncome.toFixed(2)}</div>
                    <div>Annual: ${annualIncome.toFixed(2)} ({yieldPercentage.toFixed(2)}%)</div>
                  </div>
                </div>

                <button className="w-full bg-emerald-600 text-white py-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Buy {tokenAmount} Tokens
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By purchasing, you agree to our Terms of Service and Risk Disclosure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
