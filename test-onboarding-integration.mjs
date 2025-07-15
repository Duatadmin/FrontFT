#!/usr/bin/env node

/**
 * Test script for the onboarding API integration
 * 
 * This script simulates what the frontend will send to the API
 * to ensure the data format matches expectations.
 */

import fetch from 'node-fetch';

const API_URL = 'https://whatsapp-bot-production-ea3b.up.railway.app';

// Sample data that matches what the frontend collects
const testData = {
  user_id: 'test_user_' + Date.now(),
  onboarding_data: {
    goal: "Build Muscle",
    goal_detail: "bigger arms and shoulders",
    goal_timeline_weeks: 12,
    level: "intermediate",
    age: 28,
    sex: "male",
    height_cm: 180,
    weight_kg: 75,
    available_days_per_week: 4,
    preferred_days: ["Mon", "Tue", "Thu", "Fri"],
    session_duration_minutes: 60,
    split_preference: "push_pull_legs",
    location: "gym",
    equipment: ["dumbbells", "barbell", "pull-up bar", "gym machines"],
    injuries: "none",
    sleep_hours_normalized: 7.5,
    baseline_capacity: {
      pushups: 25,
      squats: 30,
      plank_seconds: 60
    },
    preferences: "Love compound movements, not a fan of cardio"
  }
};

async function testOnboardingSubmit() {
  console.log('Testing onboarding API integration...\n');
  console.log('Sending data:', JSON.stringify(testData, null, 2));
  console.log('\n---\n');

  try {
    const response = await fetch(`${API_URL}/api/v1/onboarding/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Error:', response.status);
      console.log('Response:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Run the test
testOnboardingSubmit();