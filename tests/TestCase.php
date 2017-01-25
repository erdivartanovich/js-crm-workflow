<?php
namespace Test;

use Faker\Factory as Faker;
use Illuminate;
use Mockery as m;

class TestCase extends Illuminate\Foundation\Testing\TestCase
{

    protected $faker;

    protected function setUp()
    {
        parent::setUp();

        $this->faker = Faker::create();
    }


    protected function tearDown()
    {
        parent::tearDown();
        m::close();
        unset($this->faker);
    }
    /**
     * The base URL to use while testing the application.
     *
     * @var string
     */
    protected $baseUrl = 'http://localhost';

    /**
     * Creates the application.
     *
     * @return \Illuminate\Foundation\Application
     */
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

        return $app;
    }


    protected function seeInDatabase($table, array $data, $connection = null)
    {
        $data = array_map(function($value) { 
            return is_bool($value) ? ($value ? 1: 0) : $value;
        }, $data);

        return parent::seeInDatabase($table, $data, $connection);
    }

    protected function notSeeInDatabase($table, array $data, $connection = null)
    {
        $data = array_map(function($value) { 
            return is_bool($value) ? ($value ? 1: 0) : $value;
        }, $data);
        return parent::notSeeInDatabase($table, $data, $connection);
    }


    protected function isTrashedInDatabase($table, array $data, $connection = null)
    {
        $database = $this->app->make('db');
        $connection = $connection ?: $database->getDefaultConnection();
        $count = $database->connection($connection)
        ->table($table)
        ->where($data)
        ->whereNotNull('deleted_at')
        ->count();
        
        $this->assertGreaterThan(0, $count, sprintf(
            'Found unexpected records in database table [%s] that matched attributes [%s].', $table, json_encode($data)
        ));

        return $this;
    }

    protected function except(array $keys, array $array )
    {
       return array_diff_key($array, array_flip((array) $keys));
    }



    /**
     * Removed persons records.
     * @param  array  $persons
     * @return void
     */
    protected function cleanUpRecords($observer, $data, $fromDeleted = false)
    {
        if(is_array($data)){
            foreach ($data as $thePerson) {
                $observer->removed($thePerson, $fromDeleted);
            }    
        }else{
            $observer->removed($data, $fromDeleted);
        }
    }
}
