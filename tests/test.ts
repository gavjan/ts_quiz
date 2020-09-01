import {Builder, By} from "selenium-webdriver";

function test_logout_on_all_sessions() {
    let driver = new Builder().forBrowser('firefox').build();

    driver.get('http://localhost:8080/').then(() =>
        driver.findElement(By.id("username_box")).sendKeys("user1").then(() =>
            driver.findElement(By.id("password_box")).sendKeys("user1").then(() =>
                driver.findElement(By.id("submit_button")).click().then(() =>
                    driver.manage().getCookies().then(cookie =>
                        driver.manage().deleteAllCookies().then(() =>
                            driver.get('http://localhost:8080/').then(() =>
                                driver.findElement(By.id("username_box")).sendKeys("user1").then(() =>
                                    driver.findElement(By.id("password_box")).sendKeys("user1").then(() =>
                                        driver.findElement(By.id("submit_button")).click().then(() =>
                                            driver.findElement(By.id("change_pass_button")).click().then(() =>
                                                driver.findElement(By.id("password_box")).sendKeys("user1").then(() =>
                                                    driver.findElement(By.id("password_box2")).sendKeys("user1").then(() =>
                                                        driver.findElement(By.id("submit_button")).click().then(() =>
                                                            driver.manage().deleteAllCookies().then(() =>
                                                                driver.manage().addCookie({name:cookie[1].name, value:cookie[1].value}).then(() =>
                                                                    driver.get('http://localhost:8080/')
                                                                )
                                                            )
                                                        )
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                )
            )
        )
    )
}
test_logout_on_all_sessions();
