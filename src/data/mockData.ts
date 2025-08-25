import { Property } from '../types';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury Downtown Apartment',
    location: 'Manhattan, New York',
    image: 'https://images.pexels.com/photos/1642125/pexels-photo-1642125.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'A stunning 2-bedroom luxury apartment in the heart of Manhattan with breathtaking city views.',
    valuation: 850000,
    tokenPrice: 100,
    totalTokens: 8500,
    availableTokens: 3420,
    expectedYield: 8.5,
    monthlyRent: 6000,
    contractAddress: '0x742d35Cc6634C0532925a3b8D...',
    documents: ['ownership_deed.pdf', 'rental_agreement.pdf', 'inspection_report.pdf']
  },
  {
    id: '2',
    title: 'Modern Office Complex',
    location: 'Austin, Texas',
    image: 'https://images.pexels.com/photos/2034851/pexels-photo-2034851.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'A state-of-the-art office building with sustainable features and prime location.',
    valuation: 1200000,
    tokenPrice: 150,
    totalTokens: 8000,
    availableTokens: 5200,
    expectedYield: 7.2,
    monthlyRent: 8500,
    contractAddress: '0x8f3d4Fe2b5E7c1A9D3B2F8E...',
    documents: ['ownership_deed.pdf', 'tenant_agreements.pdf', 'financial_report.pdf']
  },
  {
    id: '3',
    title: 'Beachfront Villa',
    location: 'Miami, Florida',
    image: 'https://images.pexels.com/photos/1974596/pexels-photo-1974596.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Exclusive beachfront property with panoramic ocean views and luxury amenities.',
    valuation: 2500000,
    tokenPrice: 250,
    totalTokens: 10000,
    availableTokens: 7800,
    expectedYield: 6.8,
    monthlyRent: 15000,
    contractAddress: '0x1a2b3c4d5e6f7g8h9i0j1k2...',
    documents: ['ownership_deed.pdf', 'property_management.pdf', 'insurance_docs.pdf']
  }
];

export const mockPortfolioData = {
  totalValue: 125000,
  totalRentReceived: 8450,
  monthlyIncomeData: [
    { month: 'Jan', income: 850 },
    { month: 'Feb', income: 920 },
    { month: 'Mar', income: 1100 },
    { month: 'Apr', income: 980 },
    { month: 'May', income: 1250 },
    { month: 'Jun', income: 1180 }
  ],
  properties: [
    {
      id: '1',
      property: mockProperties[0],
      tokensOwned: 125,
      incomeReceived: 3200,
      purchaseDate: '2024-01-15'
    },
    {
      id: '2',
      property: mockProperties[1],
      tokensOwned: 87,
      incomeReceived: 2150,
      purchaseDate: '2024-02-20'
    }
  ]
};