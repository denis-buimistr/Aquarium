import requests
import sys
import time
from datetime import datetime

class AquariumAPITester:
    def __init__(self):
        # Use the same URL as frontend for consistency
        self.base_url = "https://fish-quest-8.preview.emergentagent.com/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            
            print(f"   Response Status: {response.status_code}")
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - {name}")
                try:
                    response_data = response.json()
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ FAILED - {name}")
                print(f"   Expected status: {expected_status}, got: {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error details: {error_detail}")
                except:
                    print(f"   Error response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ FAILED - {name} - Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = int(time.time())
        test_email = f"test_user_{timestamp}@test.com"
        test_password = "TestPass123!"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"email": test_email, "password": test_password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user_id']
            print(f"   Registered user: {test_email}")
            return True, test_email, test_password
        return False, None, None

    def test_user_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user_id']
            return True
        return False

    def test_get_aquarium_fish(self):
        """Test getting aquarium fish"""
        success, response = self.run_test(
            "Get Aquarium Fish",
            "GET",
            "fish/aquarium",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} fish in aquarium")
            return True, response
        return False, []

    def test_get_all_fish(self):
        """Test getting all fish data"""
        success, response = self.run_test(
            "Get All Fish",
            "GET",
            "fish/all",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} total fish species")
            return True, response
        return False, []

    def test_get_fish_detail(self, fish_id):
        """Test getting fish details by ID"""
        success, response = self.run_test(
            f"Get Fish Detail (ID: {fish_id})",
            "GET",
            f"fish/{fish_id}",
            200
        )
        
        if success and 'id' in response:
            print(f"   Fish details: {response['name']} - {response['rarity']}")
            return True, response
        return False, {}

    def test_gacha_status(self):
        """Test getting gacha status"""
        success, response = self.run_test(
            "Get Gacha Status",
            "GET",
            "gacha/status",
            200
        )
        
        if success and 'cases_remaining' in response:
            print(f"   Cases remaining: {response['cases_remaining']}")
            return True, response
        return False, {}

    def test_open_gacha(self):
        """Test opening a gacha case"""
        success, response = self.run_test(
            "Open Gacha Case",
            "POST",
            "gacha/open",
            200
        )
        
        if success and 'fish' in response:
            fish = response['fish']
            print(f"   Got fish: {fish['name']} ({fish['rarity']}) - {response['total_points']} points")
            print(f"   New fish: {response['is_new']}")
            return True, response
        return False, {}

    def test_reset_gacha(self):
        """Test resetting gacha cases (admin endpoint)"""
        success, response = self.run_test(
            "Reset Gacha Cases",
            "POST",
            "gacha/reset",
            200
        )
        
        if success:
            print("   Gacha cases reset successfully")
            return True
        return False

    def test_get_leaderboard(self):
        """Test getting leaderboard"""
        success, response = self.run_test(
            "Get Leaderboard",
            "GET",
            "leaderboard",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Leaderboard has {len(response)} entries")
            return True, response
        return False, []

    def test_get_user_collection(self):
        """Test getting user's fish collection"""
        success, response = self.run_test(
            "Get User Collection",
            "GET",
            "user/collection",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   User has {len(response)} fish in collection")
            return True, response
        return False, []

    def test_get_user_stats(self):
        """Test getting user statistics"""
        success, response = self.run_test(
            "Get User Stats",
            "GET",
            "user/stats",
            200
        )
        
        if success and 'total_points' in response:
            print(f"   User stats: {response['total_points']} points, {response['total_fish']} fish")
            return True, response
        return False, {}

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting Aquarium API Test Suite")
        print("=" * 50)
        
        # Test user registration and login
        reg_success, email, password = self.test_user_registration()
        if not reg_success:
            print("❌ Registration failed, cannot continue tests")
            return self.get_results()
        
        # Test getting fish data (requires auth)
        aquarium_success, aquarium_fish = self.test_get_aquarium_fish()
        all_fish_success, all_fish = self.test_get_all_fish()
        
        # Test fish details if we have fish data
        if all_fish_success and len(all_fish) > 0:
            first_fish = all_fish[0]
            self.test_get_fish_detail(first_fish['id'])
        
        # Test gacha system
        gacha_status_success = self.test_gacha_status()
        if gacha_status_success:
            # Test opening a case
            gacha_success = self.test_open_gacha()
            
            # Test reset functionality
            self.test_reset_gacha()
        
        # Test leaderboard and user data
        self.test_get_leaderboard()
        self.test_get_user_collection()
        self.test_get_user_stats()
        
        # Test login with existing user
        login_success = self.test_user_login(email, password)
        
        return self.get_results()

    def get_results(self):
        """Get test results summary"""
        print("\n" + "=" * 50)
        print("📊 TEST RESULTS")
        print("=" * 50)
        print(f"Total tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 ALL TESTS PASSED!")
            return 0
        else:
            print("❌ Some tests failed")
            return 1

def main():
    tester = AquariumAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())