import { Editor } from '@monaco-editor/react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, FormControl, InputGroup, Modal, Row, Spinner, Table } from 'react-bootstrap';
import './App.css';

function App() {
  const [query, setQuery] = useState('SELECT * FROM invoices LIMIT 10;');
  const [results, setResults] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [showImagePopover, setShowImagePopover] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState(null);
  const [editingFeatures, setEditingFeatures] = useState(null);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [newFeatureKey, setNewFeatureKey] = useState('');
  const [newFeatureValue, setNewFeatureValue] = useState('');
  const [featureSearchQuery, setFeatureSearchQuery] = useState('');
  const imageRefs = useRef({});
  
  // Handle window resize to hide image preview
  useEffect(() => {
    const handleResize = () => {
      if (showImagePopover) {
        setShowImagePopover(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [showImagePopover]);

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/execute-query`, {
        query: query
      });
      
      setResults(response.data.data);
      setColumns(response.data.columns);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'An error occurred');
      setResults(null);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFeatureEdit = (features, approvableId) => {
    setEditingFeatures({
      features: { ...features },
      approvableId: approvableId
    });
    setShowFeaturesModal(true);
  };
  
  const handleSaveFeatures = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/update-features`, {
        approvable_id: editingFeatures.approvableId,
        features: editingFeatures.features
      });
      
      if (response.data.success) {
        // Update the local state to reflect the changes
        const updatedResults = results.map(row => {
          if (row.id === editingFeatures.approvableId) {
            return { ...row, features: editingFeatures.features };
          }
          return row;
        });
        
        setResults(updatedResults);
        setShowFeaturesModal(false);
        
        // Display success message
        setError(null); // Clear any previous errors
        
        // If we're viewing invoices, refresh the data to get updated features
        if (query.toLowerCase().includes('invoices')) {
          // Slight delay to ensure the backend has processed the update
          setTimeout(() => {
            executeQuery();
          }, 500);
        }
      }
    } catch (error) {
      setError('Error updating features: ' + (error.response?.data?.detail || error.message));
    }
  };
  
  const handleAddFeature = () => {
    if (newFeatureKey.trim() && editingFeatures) {
      setEditingFeatures({
        ...editingFeatures,
        features: {
          ...editingFeatures.features,
          [newFeatureKey.trim()]: newFeatureValue.trim()
        }
      });
      
      setNewFeatureKey('');
      setNewFeatureValue('');
    }
  };
  
  const handleRemoveFeature = (key) => {
    if (editingFeatures) {
      const updatedFeatures = { ...editingFeatures.features };
      delete updatedFeatures[key];
      
      setEditingFeatures({
        ...editingFeatures,
        features: updatedFeatures
      });
    }
  };
  
  const handleFeatureSearch = () => {
    if (featureSearchQuery.trim()) {
      // Parse the feature search query (format: key=value)
      const [key, value] = featureSearchQuery.split('=').map(part => part.trim());
      
      if (key && value) {
        const searchQuery = `
          SELECT a.* 
          FROM invoices a 
          JOIN invoices_features f ON a.id = f.approvable_id 
          WHERE f.features->>'${key}' = '${value}'
        `;
        
        setQuery(searchQuery);
        executeQuery();
      }
    }
  };

  const handleEditorChange = (value) => {
    setQuery(value);
  };

  const renderTableHeader = () => {
    return columns.map((column, index) => (
      <th key={index}>{column}</th>
    ));
  };

  const handleImagePreview = (event, imageUrl) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = event.target.getBoundingClientRect();
    setCurrentImage(imageUrl);
    
    // Calculate position relative to viewport
    const position = {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height
    };
    
    setPopoverTarget(position);
    setShowImagePopover(true);
  };

  const closeImagePreview = () => {
    setShowImagePopover(false);
  };

  const handleImageClick = (event, imageUrl) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentImage(imageUrl);
    setShowImageModal(true);
  };

  const renderTableData = () => {
    return results.map((row, rowIndex) => (
      <tr key={rowIndex}>
        {columns.map((column, colIndex) => (
          <td key={colIndex}>
            {column === 'image_url' && row[column] ? (
              <div>
                <div className="image-container" title="Click to preview invoice | Double-click for fullscreen">
                  <img 
                    ref={(el) => imageRefs.current[`img-${rowIndex}`] = el}
                    src={row[column]} 
                    alt="Invoice" 
                    style={{ 
                      maxWidth: '100px', 
                      maxHeight: '100px',
                      cursor: 'pointer',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '3px'
                    }} 
                    onClick={(e) => handleImagePreview(e, row[column])}
                    onDoubleClick={(e) => handleImageClick(e, row[column])}
                  />
                </div>
              </div>
            ) : column === 'features' && row[column] ? (
              <div>
                <div className="features-preview">
                  {Object.entries(row[column]).map(([key, value]) => (
                    <div key={key} className="feature-tag">
                      <span className="feature-key">{key}:</span> {value}
                    </div>
                  ))}
                </div>
                <Button 
                  size="sm" 
                  variant="outline-primary" 
                  className="mt-2" 
                  onClick={() => handleFeatureEdit(row[column], row.id)}
                >
                  Edit Features
                </Button>
              </div>
            ) : (
              String(row[column] !== null ? row[column] : '')
            )}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-center">Redshift Query App</h1>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={4}>
          <Card className="mb-3">
            <Card.Header>Feature Search</Card.Header>
            <Card.Body>
              <InputGroup className="mb-3">
                <FormControl
                  placeholder="key=value (e.g. customer=Acme Corp)"
                  value={featureSearchQuery}
                  onChange={(e) => setFeatureSearchQuery(e.target.value)}
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={handleFeatureSearch}
                >
                  Search
                </Button>
              </InputGroup>
              <small className="text-muted">
                Search for invoices by feature values using key=value format
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card>
            <Card.Header>SQL Query Editor</Card.Header>
            <Card.Body>
              <div style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
                <Editor
                  height="200px"
                  language="sql"
                  value={query}
                  onChange={handleEditorChange}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14
                  }}
                />
              </div>
              <div className="mt-3 d-flex justify-content-end">
                <Button 
                  variant="primary" 
                  onClick={executeQuery} 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />
                      {' '}Running Query...
                    </>
                  ) : (
                    'Execute Query'
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger">
              <strong>Error:</strong> {error}
            </Alert>
          </Col>
        </Row>
      )}

      {results && (
        <Row>
          <Col>
            <Card>
              <Card.Header>Query Results</Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>{renderTableHeader()}</tr>
                    </thead>
                    <tbody>
                      {renderTableData()}
                    </tbody>
                  </Table>
                </div>
                <div className="mt-2 text-muted">
                  {results.length} rows returned
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Custom Image Preview on Hover */}
      {showImagePopover && currentImage && popoverTarget && (
        <div 
          className="custom-image-preview"
          style={{
            position: 'fixed',
            left: Math.min(popoverTarget.x + popoverTarget.width + 20, window.innerWidth - 820) + 'px',
            top: Math.min(Math.max(20, popoverTarget.y - 300), window.innerHeight - 820) + 'px',
            zIndex: 1050,
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '10px',
            boxShadow: '0 5px 25px rgba(0, 0, 0, 0.3)',
          }}
          onMouseLeave={closeImagePreview}
        >
          <button 
            className="close-preview-btn" 
            onClick={closeImagePreview}
            style={{
              position: 'absolute',
              right: '5px',
              top: '5px',
              background: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              fontSize: '16px',
              cursor: 'pointer',
              zIndex: 1051,
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            }}
          >
            ×
          </button>
          <div>
            <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
              <strong>Click</strong> outside to close | <strong>Double-click</strong> image for fullscreen
            </div>
            <img
              src={currentImage}
              alt="Invoice details"
              style={{ 
                maxWidth: '800px', 
                maxHeight: '800px',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      )}

      {/* Image Modal on Click */}
      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Invoice Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-0">
          {currentImage && (
            <img
              src={currentImage}
              alt="Invoice full details"
              style={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Features Edit Modal */}
      <Modal show={showFeaturesModal} onHide={() => setShowFeaturesModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Invoice Features</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingFeatures && (
            <>
              <div className="mb-3">
                <h6>Current Features:</h6>
                {Object.keys(editingFeatures.features).length > 0 ? (
                  <div className="features-list">
                    {Object.entries(editingFeatures.features).map(([key, value]) => (
                      <div key={key} className="feature-item d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                        <div>
                          <strong>{key}:</strong> {value}
                        </div>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleRemoveFeature(key)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No features added yet</p>
                )}
              </div>
              
              <h6>Add New Feature:</h6>
              <Form.Group className="mb-3">
                <Form.Label>Key</Form.Label>
                <Form.Control 
                  type="text" 
                  value={newFeatureKey}
                  onChange={(e) => setNewFeatureKey(e.target.value)}
                  placeholder="e.g. invoice_number"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Value</Form.Label>
                <Form.Control 
                  type="text" 
                  value={newFeatureValue}
                  onChange={(e) => setNewFeatureValue(e.target.value)}
                  placeholder="e.g. INV-2025-001"
                />
              </Form.Group>
              
              <Button 
                variant="outline-primary" 
                onClick={handleAddFeature}
                disabled={!newFeatureKey.trim()}
              >
                Add Feature
              </Button>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeaturesModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveFeatures}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default App;
