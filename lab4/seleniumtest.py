from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver import ActionChains
import time

driver = webdriver.Chrome('/Users/angelinajo/Documents/Liuplugg/TDDD97/lab3/twidder/chromedriver')
driver.get("http://127.0.0.1:5000/")
assert "Twidder" in driver.title

# Singup test
driver.find_element_by_id("firstname").send_keys("Klas")
driver.find_element_by_id("familyname").send_keys("Gudmundsson")
driver.find_element_by_id("w3-select").send_keys("Male")
driver.find_element_by_id("city").send_keys("Linkoping")
driver.find_element_by_id("country").send_keys("Sweden")
driver.find_element_by_id("email").send_keys("a@a.a")
driver.find_element_by_id("password").send_keys("asd")
driver.find_element_by_id("repeat").send_keys("asd")
driver.find_element_by_id("savesave").click()
user_created = driver.find_element_by_id("response").get_attribute('innerHTML') == "User created successfully"
user_exists = driver.find_element_by_id("response").get_attribute('innerHTML') == "User already exists"
result = user_created or user_exists
assert result

# Login Test with wrong password
driver.find_element_by_id("email1").send_keys("a@a.a")
driver.find_element_by_id("password1").send_keys("asde")
driver.find_element_by_id("loginbutton").click()
time.sleep(1)
assert driver.find_element_by_id("responselog").get_attribute('innerHTML') == "wrong password"



# Login Test
driver.find_element_by_id("email1").clear()
driver.find_element_by_id("password1").clear()
driver.find_element_by_id("email1").send_keys("a@a.a")
driver.find_element_by_id("password1").send_keys("asd")
driver.find_element_by_id("loginbutton").click()
time.sleep(1)
assert driver.find_element_by_id("home-info-firstname").get_attribute('innerHTML') == "Klas"


# Post and Drag the oldest message to the text-area  (Mouse must be over text-area to post, why?)
'''driver.find_element_by_id("home-inputpost").send_keys("This is test number 3")
driver.find_element_by_id("postonwall").click()
element = driver.find_element_by_id("home-apost")
target = driver.find_element_by_id("home-inputpost")
action_chains = ActionChains(driver)
action_chains.drag_and_drop(element, target).perform()
time.sleep(1)
assert driver.find_element_by_id("home-inputpost").get_attribute('value') == "a@a.a - This is test number 3"'''

# Browse a user
driver.find_element_by_id("browsebutton").click()
driver.find_element_by_id("search").send_keys("a@a.a")
driver.find_element_by_id("searchbutton").click()
time.sleep(1)
assert driver.find_element_by_id("home-info-firstname").get_attribute('innerHTML') == "Klas"

# Signout
driver.find_element_by_id("signout").click()
assert driver.find_element_by_id("email1").get_attribute('innerHTML') == ""


time.sleep(2)
driver.close()