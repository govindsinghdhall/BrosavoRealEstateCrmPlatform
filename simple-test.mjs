// Simple test for validation behavior
import { propertySchemaWithConditionalValidation } from './src/schemas/property.schema.js';

console.log('Testing basic Plot validation...');

try {
  // Test: Valid Plot with all configuration fields omitted
  const result = propertySchemaWithConditionalValidation.parse({
    type: 'PLOT',
    title: 'Test Plot',
    description: 'A test plot description',
    listingCategory: 'BUY',
    status: 'AVAILABLE',
    price: 5000000,
    address: 'Test Address',
    city: 'Gurgaon',
    state: 'Haryana',
    zipCode: '122001',
    locality: 'Sector 15',
    sector: 'A',
    area: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
  });
  
  console.log('✅ PASS - Plot validation successful');
  console.log('Result type:', result.type);
} catch (error) {
  console.log('❌ FAIL - Plot validation failed:', error.issues?.[0]?.message || error.message);
}

console.log('Testing Apartment validation...');

try {
  // Test: Apartment should fail when bedrooms is missing
  const result = propertySchemaWithConditionalValidation.parse({
    type: 'APARTMENT',
    title: 'Test Apartment',
    description: 'A test apartment description',
    listingCategory: 'BUY',
    status: 'AVAILABLE',
    price: 5000000,
    address: 'Test Address',
    city: 'Gurgaon',
    state: 'Haryana',
    zipCode: '122001',
    locality: 'Sector 15',
    sector: 'A',
    bedrooms: undefined, // Should fail
    bathrooms: 2,
    area: 1000,
  });
  
  console.log('❌ FAIL - Apartment should have failed but passed');
} catch (error) {
  console.log('✅ PASS - Apartment correctly failed:', error.issues?.[0]?.message || error.message);
}

console.log('Test complete.');