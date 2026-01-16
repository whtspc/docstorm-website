/**
 * DocStorm Mock Records
 * Sample data demonstrating the JSON schema for different record types
 */

// Lead record - from business card scan
export const leadData = {
  type: 'single',
  recordType: 'Lead',
  icon: 'user',
  fields: [
    { label: 'First Name', value: 'Sarah', type: 'text' },
    { label: 'Last Name', value: 'Chen', type: 'text' },
    { label: 'Company', value: 'TechFlow Solutions', type: 'text' },
    { label: 'Title', value: 'VP of Engineering', type: 'text' },
    { label: 'Email', value: 'sarah.chen@techflow.io', type: 'email' },
    { label: 'Phone', value: '+1 (415) 555-0142', type: 'phone' }
  ],
  recordPageMeta: {
    recordName: 'Sarah Chen',
    status: 'Open - Not Contacted',
    statusVariant: 'info'
  },
  highlights: [
    { label: 'Company', value: 'TechFlow Solutions', type: 'text' },
    { label: 'Title', value: 'VP of Engineering', type: 'text' },
    { label: 'Email', value: 'sarah.chen@techflow.io', type: 'email' },
    { label: 'Phone', value: '+1 (415) 555-0142', type: 'phone' }
  ],
  activities: [
    { type: 'email', text: 'Welcome email sent', date: 'Today' },
    { type: 'task', text: 'Follow-up call scheduled', date: 'Tomorrow' },
    { type: 'event', text: 'Demo meeting', date: 'Dec 23' }
  ]
};

// Order with line items - from order PDF
export const orderData = {
  type: 'parent-child',
  recordType: 'Order',
  icon: 'document',
  parent: {
    title: 'Order Details',
    fields: [
      { label: 'Order Number', value: 'ORD-2024-0847', type: 'text' },
      { label: 'Customer', value: 'Acme Corporation', type: 'text' },
      { label: 'Order Date', value: '2024-12-15', type: 'date' },
      { label: 'Status', value: 'Processing', type: 'text' },
      { label: 'Total', value: 4250.00, type: 'currency' }
    ]
  },
  children: {
    title: 'Order Line Items',
    columns: ['Product', 'SKU', 'Qty', 'Unit Price', 'Subtotal'],
    columnTypes: ['text', 'text', 'number', 'currency', 'currency'],
    rows: [
      ['Widget Pro', 'WP-001', 10, 150.00, 1500.00],
      ['Gadget Plus', 'GP-042', 5, 350.00, 1750.00],
      ['Accessory Kit', 'AK-100', 20, 50.00, 1000.00]
    ]
  },
  recordPageMeta: {
    recordName: 'ORD-2024-0847',
    status: 'Processing',
    statusVariant: 'warning'
  },
  highlights: [
    { label: 'Customer', value: 'Acme Corporation', type: 'text' },
    { label: 'Order Date', value: '2024-12-15', type: 'date' },
    { label: 'Status', value: 'Processing', type: 'text' },
    { label: 'Total', value: 4250.00, type: 'currency' }
  ],
  activities: [
    { type: 'email', text: 'Order confirmation sent', date: 'Today' },
    { type: 'task', text: 'Shipping notification pending', date: 'Tomorrow' },
    { type: 'note', text: 'Customer confirmed quantities', date: 'Dec 14' }
  ]
};

// Invoice - from invoice document
export const invoiceData = {
  type: 'parent-child',
  recordType: 'Invoice',
  icon: 'document',
  parent: {
    title: 'Invoice',
    fields: [
      { label: 'Invoice Number', value: 'INV-2024-1234', type: 'text' },
      { label: 'Vendor', value: 'Office Supplies Co.', type: 'text' },
      { label: 'Invoice Date', value: '2024-12-10', type: 'date' },
      { label: 'Due Date', value: '2025-01-10', type: 'date' },
      { label: 'Amount Due', value: 892.50, type: 'currency' }
    ]
  },
  children: {
    title: 'Line Items',
    columns: ['Description', 'Quantity', 'Rate', 'Amount'],
    columnTypes: ['text', 'number', 'currency', 'currency'],
    rows: [
      ['Premium Paper (case)', 5, 45.00, 225.00],
      ['Ink Cartridges', 12, 35.00, 420.00],
      ['Binder Clips (box)', 10, 8.50, 85.00],
      ['Shipping & Handling', 1, 12.50, 12.50]
    ]
  },
  recordPageMeta: {
    recordName: 'INV-2024-1234',
    status: 'Pending Payment',
    statusVariant: 'warning'
  },
  highlights: [
    { label: 'Vendor', value: 'Office Supplies Co.', type: 'text' },
    { label: 'Due Date', value: '2025-01-10', type: 'date' },
    { label: 'Amount Due', value: 892.50, type: 'currency' },
    { label: 'Status', value: 'Pending Payment', type: 'text' }
  ],
  activities: [
    { type: 'email', text: 'Invoice received and processed', date: 'Today' },
    { type: 'task', text: 'Payment reminder scheduled', date: 'Jan 5' },
    { type: 'note', text: 'Approved by finance team', date: 'Dec 10' }
  ]
};

// Meeting summary with action items - from transcript
export const meetingSummaryData = {
  type: 'parent-child',
  recordType: 'Meeting Summary',
  icon: 'calendar',
  parent: {
    title: 'Meeting Details',
    fields: [
      { label: 'Subject', value: 'Q1 Planning Session', type: 'text' },
      { label: 'Date', value: '2024-12-18', type: 'date' },
      { label: 'Duration', value: '45 minutes', type: 'text' },
      { label: 'Attendees', value: '5 participants', type: 'text' },
      { label: 'Summary', value: 'Discussed roadmap priorities and resource allocation for Q1', type: 'text' }
    ]
  },
  children: {
    title: 'Action Items',
    columns: ['Task', 'Assignee', 'Due Date', 'Priority'],
    columnTypes: ['text', 'text', 'date', 'text'],
    rows: [
      ['Draft Q1 roadmap document', 'Sarah Chen', '2024-12-22', 'High'],
      ['Review budget proposals', 'Mike Johnson', '2024-12-20', 'High'],
      ['Schedule follow-up meeting', 'Admin', '2024-12-19', 'Medium']
    ]
  },
  recordPageMeta: {
    recordName: 'Q1 Planning Session',
    status: 'Completed',
    statusVariant: 'success'
  },
  highlights: [
    { label: 'Date', value: '2024-12-18', type: 'date' },
    { label: 'Duration', value: '45 minutes', type: 'text' },
    { label: 'Attendees', value: '5 participants', type: 'text' },
    { label: 'Action Items', value: '3 items', type: 'text' }
  ],
  activities: [
    { type: 'email', text: 'Summary shared with attendees', date: 'Today' },
    { type: 'task', text: 'Action items assigned', date: 'Today' },
    { type: 'note', text: 'Recording uploaded', date: 'Today' }
  ]
};

// Contact record - simple single record
export const contactData = {
  type: 'single',
  recordType: 'Contact',
  icon: 'user',
  fields: [
    { label: 'First Name', value: 'Michael', type: 'text' },
    { label: 'Last Name', value: 'Rodriguez', type: 'text' },
    { label: 'Account', value: 'Global Industries Inc.', type: 'text' },
    { label: 'Email', value: 'm.rodriguez@globalind.com', type: 'email' },
    { label: 'Phone', value: '+1 (212) 555-8834', type: 'phone' },
    { label: 'Department', value: 'Procurement', type: 'text' }
  ],
  recordPageMeta: {
    recordName: 'Michael Rodriguez',
    status: 'Active',
    statusVariant: 'success'
  },
  highlights: [
    { label: 'Account', value: 'Global Industries Inc.', type: 'text' },
    { label: 'Department', value: 'Procurement', type: 'text' },
    { label: 'Email', value: 'm.rodriguez@globalind.com', type: 'email' },
    { label: 'Phone', value: '+1 (212) 555-8834', type: 'phone' }
  ],
  activities: [
    { type: 'email', text: 'Introduction email sent', date: 'Today' },
    { type: 'call', text: 'Discovery call completed', date: 'Yesterday' },
    { type: 'note', text: 'Key decision maker for procurement', date: 'Dec 15' }
  ]
};

// Damage claim - from damaged package photo
export const damageClaimData = {
  type: 'single',
  recordType: 'Damage Claim',
  icon: 'document',
  fields: [
    { label: 'Claim Number', value: 'CLM-2024-00892', type: 'text' },
    { label: 'Tracking Number', value: '1Z999AA10123456784', type: 'text' },
    { label: 'Barcode', value: '7891234567890', type: 'text' },
    { label: 'Damage Type', value: 'Crushed/Dented', type: 'text' },
    { label: 'Severity', value: 'Moderate', type: 'text' },
    { label: 'Estimated Value', value: 245.00, type: 'currency' }
  ],
  recordPageMeta: {
    recordName: 'CLM-2024-00892',
    status: 'Under Review',
    statusVariant: 'warning'
  },
  highlights: [
    { label: 'Tracking Number', value: '1Z999AA10123456784', type: 'text' },
    { label: 'Damage Type', value: 'Crushed/Dented', type: 'text' },
    { label: 'Severity', value: 'Moderate', type: 'text' },
    { label: 'Estimated Value', value: 245.00, type: 'currency' }
  ],
  activities: [
    { type: 'task', text: 'Claim assigned to agent', date: 'Today' },
    { type: 'email', text: 'Customer notified of claim receipt', date: 'Today' },
    { type: 'note', text: 'Damage photos uploaded', date: 'Today' }
  ]
};

// Expense record - from receipt
export const expenseData = {
  type: 'single',
  recordType: 'Expense',
  icon: 'document',
  fields: [
    { label: 'Merchant', value: 'Brew Haven #4521', type: 'text' },
    { label: 'Category', value: 'Meals & Entertainment', type: 'text' },
    { label: 'Date', value: '2024-12-19', type: 'date' },
    { label: 'Payment Method', value: 'Corporate Visa *4832', type: 'text' },
    { label: 'Amount', value: 47.83, type: 'currency' },
    { label: 'Status', value: 'Pending Approval', type: 'text' }
  ],
  recordPageMeta: {
    recordName: 'Brew Haven #4521',
    status: 'Pending Approval',
    statusVariant: 'warning'
  },
  highlights: [
    { label: 'Category', value: 'Meals & Entertainment', type: 'text' },
    { label: 'Date', value: '2024-12-19', type: 'date' },
    { label: 'Amount', value: 47.83, type: 'currency' },
    { label: 'Payment Method', value: 'Corporate Visa *4832', type: 'text' }
  ],
  activities: [
    { type: 'task', text: 'Submitted for approval', date: 'Today' },
    { type: 'note', text: 'Receipt attached', date: 'Today' }
  ]
};

// Candidate record - from resume
export const candidateData = {
  type: 'single',
  recordType: 'Candidate',
  icon: 'user',
  fields: [
    { label: 'Full Name', value: 'Emily Watson', type: 'text' },
    { label: 'Position', value: 'Senior Software Engineer', type: 'text' },
    { label: 'Email', value: 'emily.watson@email.com', type: 'email' },
    { label: 'Phone', value: '+1 (628) 555-9012', type: 'phone' },
    { label: 'Experience', value: '8 years', type: 'text' },
    { label: 'Status', value: 'Phone Screen', type: 'text' }
  ],
  recordPageMeta: {
    recordName: 'Emily Watson',
    status: 'Phone Screen',
    statusVariant: 'info'
  },
  highlights: [
    { label: 'Position', value: 'Senior Software Engineer', type: 'text' },
    { label: 'Experience', value: '8 years', type: 'text' },
    { label: 'Email', value: 'emily.watson@email.com', type: 'email' },
    { label: 'Phone', value: '+1 (628) 555-9012', type: 'phone' }
  ],
  activities: [
    { type: 'email', text: 'Application received', date: 'Today' },
    { type: 'task', text: 'Phone screen scheduled', date: 'Tomorrow' },
    { type: 'note', text: 'Strong Python and AWS experience', date: 'Today' }
  ]
};

// Contract record - from signed agreement
export const contractData = {
  type: 'single',
  recordType: 'Contract',
  icon: 'document',
  fields: [
    { label: 'Contract Name', value: 'SaaS License Agreement', type: 'text' },
    { label: 'Counterparty', value: 'CloudTech Services LLC', type: 'text' },
    { label: 'Start Date', value: '2025-01-01', type: 'date' },
    { label: 'End Date', value: '2025-12-31', type: 'date' },
    { label: 'Annual Value', value: 48000.00, type: 'currency' },
    { label: 'Status', value: 'Pending Signature', type: 'text' }
  ],
  recordPageMeta: {
    recordName: 'SaaS License Agreement',
    status: 'Pending Signature',
    statusVariant: 'warning'
  },
  highlights: [
    { label: 'Counterparty', value: 'CloudTech Services LLC', type: 'text' },
    { label: 'Start Date', value: '2025-01-01', type: 'date' },
    { label: 'End Date', value: '2025-12-31', type: 'date' },
    { label: 'Annual Value', value: 48000.00, type: 'currency' }
  ],
  activities: [
    { type: 'email', text: 'Contract sent for signature', date: 'Today' },
    { type: 'task', text: 'Follow up on signature', date: 'Dec 28' },
    { type: 'note', text: 'Legal review completed', date: 'Dec 18' }
  ]
};

// Export all for convenience
export const allRecords = {
  lead: leadData,
  order: orderData,
  invoice: invoiceData,
  meetingSummary: meetingSummaryData,
  contact: contactData,
  damageClaim: damageClaimData,
  expense: expenseData,
  candidate: candidateData,
  contract: contractData
};

/**
 * Demo Scenarios (legacy - kept for compatibility)
 * Each scenario pairs a document with its resulting record data
 */
// Scenario base path
const scenarioAssetPath = 'docstorm/assets/docs/';

export const scenarios = [
  {
    id: 'businesscard-lead',
    document: {
      type: 'businesscard',
      src: scenarioAssetPath + 'businesscard.svg',
      label: 'Business Card',
      filename: 'sarah_chen_card.jpg'
    },
    record: leadData,
    processingSteps: [
      'Analyzing image...',
      'Extracting contact information...',
      'Creating Lead record...'
    ]
  },
  {
    id: 'invoice-record',
    document: {
      type: 'invoice',
      src: scenarioAssetPath + 'invoice.svg',
      label: 'Invoice',
      filename: 'invoice_2024_1234.pdf'
    },
    record: invoiceData,
    processingSteps: [
      'Reading PDF document...',
      'Extracting line items...',
      'Creating Invoice record...'
    ]
  },
  {
    id: 'order-record',
    document: {
      type: 'order',
      src: scenarioAssetPath + 'order.svg',
      label: 'Order Form',
      filename: 'order_ORD-2024-0847.pdf'
    },
    record: orderData,
    processingSteps: [
      'Processing order document...',
      'Extracting order details...',
      'Creating Order with Line Items...'
    ]
  }
];

/**
 * Demo Files - for file browser component
 * Each file can be selected, previewed, and dragged to extract data
 */
// Base path for assets - adjust based on where index.html is located
const assetBasePath = 'docstorm/assets/docs/';

export const demoFiles = [
  {
    id: 'businesscard-1',
    type: 'image',
    filename: 'businesscard.png',
    label: 'Business Card',
    previewSrc: assetBasePath + 'BusinessCard.png',
    record: leadData,
    processingSteps: [
      'Analyzing image...',
      'Extracting contact info...',
      'Creating Lead record...'
    ]
  },
  {
    id: 'invoice-1',
    type: 'pdf',
    filename: 'invoice.pdf',
    label: 'Invoice',
    previewSrc: assetBasePath + 'Invoice.png',
    record: invoiceData,
    processingSteps: [
      'Reading PDF...',
      'Extracting line items...',
      'Creating Invoice record...'
    ]
  },
  {
    id: 'order-1',
    type: 'pdf',
    filename: 'order.pdf',
    label: 'Purchase Order',
    previewSrc: assetBasePath + 'Purchase Order.png',
    record: orderData,
    processingSteps: [
      'Processing document...',
      'Extracting order details...',
      'Creating Order record...'
    ]
  },
  {
    id: 'email-1',
    type: 'email',
    filename: 'meeting-10jun.eml',
    label: 'Meeting Email',
    previewSrc: assetBasePath + 'email.png',
    record: meetingSummaryData,
    processingSteps: [
      'Parsing email...',
      'Extracting action items...',
      'Creating Meeting Summary...'
    ]
  },
  {
    id: 'damage-1',
    type: 'image',
    filename: 'damaged-pkg.jpg',
    label: 'Damaged Package',
    previewSrc: assetBasePath + 'package.png',
    record: damageClaimData,
    processingSteps: [
      'Analyzing damage...',
      'Reading barcode...',
      'Creating Damage Claim...'
    ]
  },
  {
    id: 'receipt-1',
    type: 'image',
    filename: 'receipt-brewhaven.jpg',
    label: 'Coffee Receipt',
    previewSrc: assetBasePath + 'brewhaven.png',
    record: expenseData,
    processingSteps: [
      'Scanning receipt...',
      'Extracting line items...',
      'Creating Expense record...'
    ]
  },
  {
    id: 'resume-1',
    type: 'pdf',
    filename: 'resume-watson.pdf',
    label: 'Resume',
    previewSrc: assetBasePath + 'resume.png',
    record: candidateData,
    processingSteps: [
      'Parsing resume...',
      'Extracting skills & experience...',
      'Creating Candidate record...'
    ]
  },
  {
    id: 'contract-1',
    type: 'pdf',
    filename: 'contract-cloudtech.pdf',
    label: 'Service Contract',
    previewSrc: assetBasePath + 'Contract.png',
    record: contractData,
    processingSteps: [
      'Analyzing contract...',
      'Extracting key terms...',
      'Creating Contract record...'
    ]
  }
];
