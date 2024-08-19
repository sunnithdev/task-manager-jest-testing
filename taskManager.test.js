const { Builder, By, Key, until } = require('selenium-webdriver');
const { expect } = require('@jest/globals');

describe('Task Manager Functional Tests', () => {
    let driver;

    beforeAll(async () => {
        driver = await new Builder().forBrowser('chrome').build();
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    test('Add New Task - Verify Task Addition and Validation Feedback', async () => {
        await driver.get('http://localhost:3005'); // Adjust this URL as needed
        await driver.findElement(By.id('taskName')).sendKeys('Test Task');
        await driver.findElement(By.id('description')).sendKeys('Test Description');
        await driver.findElement(By.id('assignee')).sendKeys('John Doe');
        await driver.findElement(By.id('date')).sendKeys('2024-01-01', Key.RETURN); // Ensuring date picker closes

        // Selecting task status
        await driver.findElement(By.id('statusInProgress')).click();
        await driver.findElement(By.id('submit')).click();

        // Check for addition feedback
        await driver.wait(until.elementLocated(By.id('toastMessage')), 10000);
        const toastMessage = await driver.findElement(By.id('toastMessage')).getText();
        expect(toastMessage).toContain('Task Added Successfully');

        // Verify the task appears in the list
        await driver.wait(until.elementLocated(By.css('.table-data')), 10000);
        const taskListContent = await driver.findElement(By.css('.table-data')).getText();
        expect(taskListContent).toContain('Test Task');
        expect(taskListContent).toContain('In Progress');
    });

    test('Update Task Status - Verify Correct Status Update', async () => {
        await driver.get('http://localhost:3005');
        const editButtons = await driver.findElements(By.css('.edit-btn'));
        if (editButtons.length > 0) {
            await editButtons[0].click();
            const statusCompleted = await driver.findElement(By.id('statusCompleted'));
            await driver.wait(until.elementIsVisible(statusCompleted), 10000);
            await statusCompleted.click();
            const updateButton = await driver.findElement(By.id('update'));
            await driver.wait(until.elementIsVisible(updateButton), 10000);
            await updateButton.click();
        } else {
            throw new Error('No tasks available to edit');
        }
    });

    test('Delete Task - Ensure Task is Removed', async () => {
        await driver.get('http://localhost:3005');
        const deleteButtons = await driver.findElements(By.css('.delete-btn'));
        if (deleteButtons.length > 0) {
            await deleteButtons[0].click();
            await driver.switchTo().alert().accept();

            const toastMessage = await driver.wait(until.elementLocated(By.id('toastMessage')), 10000).getText();
            expect(toastMessage).toContain('Task Deleted Successfully');
        } else {
            throw new Error('No tasks available to delete');
        }
    });
});
