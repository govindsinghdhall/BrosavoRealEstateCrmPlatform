// Test script to validate Plot property validation behavior
const { propertySchemaWithConditionalValidation } = require('./src/schemas/property.schema');

console.log('=== Testing Property Schema Validation ===\n');

// Test 1: Valid Plot with all configuration fields omitted
console.log('Test 1: Valid Plot with all configuration fields omitted');
try {
  const plotValid = propertySchemaWithConditionalValidation.parse({
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
    area: undefined, // Should be optional
    bedrooms: undefined, // Should be optional
    bathrooms: undefined, // Should be optional
  });
  console.log('✅ PASS - Plot validation successful');
} catch (error) {
  console.log('❌ FAIL - Plot validation failed:', error.issues[0].message);
}

// Test 2: Valid Plot with all fields empty
console.log('\nTest 2: Valid Plot with all fields empty');
try {
  const plotValid = propertySchemaWithConditionalValidation.parse({
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
    area: null, // Empty value
    bedrooms: null, // Empty value
    bathrooms: null, // Empty value
  });
  console.log('✅ PASS - Plot with empty values validation successful');
} catch (error) {
  console.log('❌ FAIL - Plot with empty values validation failed:', error.issues[0].message);
}

// Test 3: Apartment with bedrooms omitted (should fail)
console.log('\nTest 3: Apartment with bedrooms omitted (should fail)');
try {
  const apartmentInvalid = propertySchemaWithConditionalValidation.parse({
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
    bedrooms: undefined, // Should be required for apartments
    bathrooms: 2,
    area: 1000,
  });
  console.log('❌ FAIL - Apartment should have failed but passed');
} catch (error) {
  console.log('✅ PASS - Apartment validation correctly failed:', error.issues[0].message);
}

// Test 4: Apartment with bathrooms omitted (should fail)
console.log('\nTest 4: Apartment with bathrooms omitted (should fail)');
try {
  const apartmentInvalid = propertySchemaWithConditionalValidation.parse({
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
    bedrooms: 3,
    bathrooms: undefined, // Should be required for apartments
    area: 1000,
  });
  console.log('❌ FAIL - Apartment should have failed but passed');
} catch (error) {
  console.log('✅ PASS - Apartment validation correctly failed:', error.issues[0].message);
}

// Test 5: Apartment with area omitted (should fail)
console.log('\nTest 5: Apartment with area omitted (should fail)');
try {
  const apartmentInvalid = propertySchemaWithConditionalValidation.parse({
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
    bedrooms: 3,
    bathrooms: 2,
    area: undefined, // Should be required for apartments
  });
  console.log('❌ FAIL - Apartment should have failed but passed');
} catch (error) {
  console.log('✅ PASS - Apartment validation correctly failed:', error.issues[0].message);
}

// Test 6: Apartment with bathrooms set to 0 (should fail)
console.log('\nTest 6: Apartment with bathrooms set to 0 (should fail)');
try {
  const apartmentInvalid = propertySchemaWithConditionalValidation.parse({
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
    bedrooms: 3,
    bathrooms: 0, // Should fail (minimum is 1)
    area: 1000,
  });
  console.log('❌ FAIL - Apartment should have failed but passed');
} catch (error) {
  console.log('✅ PASS - Apartment validation correctly failed:', error.issues[0].message);
}

// Test 7: Valid Apartment with all required fields
console.log('\nTest 7: Valid Apartment with all required fields');
try {
  const apartmentValid = propertySchemaWithConditionalValidation.parse({
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
    bedrooms: 3,
    bathrooms: 2,
    area: 1000,
  });
  console.log('✅ PASS - Apartment validation successful');
} catch (error) {
  console.log('❌ FAIL - Apartment validation failed:', error.issues[0].message);
}

console.log('\n=== Test Complete ===');