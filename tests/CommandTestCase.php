<?php
namespace Test;

use Illuminate\Foundation\Testing\DatabaseTransactions;
use Symfony\Component\Console\Application;

abstract class CommandTestCase extends TestCase
{
    use DatabaseTransactions;

    /**
     * Setup testcase
     */
    protected function setUp()
    {
        parent::setUp();
    }

    /**
     * Teardown testcase
     */
    protected function tearDown()
    {
        parent::tearDown();
    }


}