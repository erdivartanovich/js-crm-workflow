<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;

use GuzzleHttp\Client as Guzzle;

use KWApi\KWApi;
use KWApi\Models\Credential;

use CRMFoundation\Domains\Note\Contracts\NoteInterface;
use CRMFoundation\Domains\Client\ClientEloquent;
use CRMFoundation\Domains\Interaction\InteractionEloquent;
use CRMFoundation\Domains\Lead\LeadEloquent;
use CRMFoundation\Domains\Listing\ListingEloquent;
use CRMFoundation\Domains\Person\PersonEloquent;
use CRMFoundation\Domains\Task\TaskEloquent;
use CRMFoundation\Domains\Note\NoteEloquent;
use CRMFoundation\Domains\User\UserEloquent;
use CRMFoundation\Domains\Person\PersonAddressEloquent;
use CRMFoundation\Domains\Person\PersonEmailEloquent;
use CRMFoundation\Domains\Person\PersonPhoneEloquent;
use CRMFoundation\Domains\Person\PersonFamilyEloquent;
use CRMFoundation\Domains\Person\PersonIdentifierEloquent;
use CRMFoundation\Domains\Person\PersonLoginEloquent;
use CRMFoundation\Domains\Person\PersonScoreEloquent;
use CRMFoundation\Domains\Person\PersonSocialAccountEloquent;
use CRMFoundation\Domains\CustomField\ObjectCustomFieldEloquent;
use CRMFoundation\Domains\Preference\PreferenceEloquent;
use CRMFoundation\Domains\Company\CompanyEloquent;
use CRMFoundation\Domains\Tag\TagEloquent;

use CRMFoundation\Domains\User\Contracts\UserRepositoryInterface;
use CRMFoundation\Domains\User\UserService;
use CRMFoundation\Domains\Team\TeamEloquent;
use Illuminate\Support\Collection;

use CRMFoundation\Observers\InteractionObserver;
use CRMFoundation\Observers\PersonObserver;
use CRMFoundation\Observers\TaskObserver;
use CRMFoundation\Observers\NoteObserver;
use CRMFoundation\Observers\PersonAddressObserver;
use CRMFoundation\Observers\PersonEmailObserver;
use CRMFoundation\Observers\PersonPhoneObserver;
use CRMFoundation\Observers\PersonFamilyObserver;
use CRMFoundation\Observers\PersonIdentifierObserver;
use CRMFoundation\Observers\PersonLoginObserver;
use CRMFoundation\Observers\PersonScoreObserver;
use CRMFoundation\Observers\PersonSocialAccountObserver;
use CRMFoundation\Observers\ObjectCustomFieldObserver;
use CRMFoundation\Observers\PreferenceObserver;
use CRMFoundation\Observers\CompanyObserver;
use CRMFoundation\Observers\UserObserver;
use CRMFoundation\Observers\TagObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {

        if (\Config::get('app.debug')) {
            \DB::enableQueryLog();
        }

        // this used to map polymorph relation value of Note model
        // see https://laravel.com/docs/5.2/eloquent-relationships for references
        Relation::morphMap([
            NoteInterface::NOTABLE_TYPE_LISTING => ListingEloquent::class,
            PersonEloquent::MORPH_NAME => PersonEloquent::class,
            TaskEloquent::TABLE_NAME => TaskEloquent::class,
            UserEloquent::TABLE_NAME => UserEloquent::class,
            TeamEloquent::TABLE_NAME => TeamEloquent::class,
            InteractionEloquent::TABLE_NAME => InteractionEloquent::class,
        ]);

        //$this->provideService($this->app->make('config')->get('preference.providers'));

        // Collection Macro
        Collection::macro('toAssoc', function () {
            return $this->reduce(function ($assoc, $keyValuePair) {
                list($key, $value) = $keyValuePair;
                $assoc[$key] = $value;
                return $assoc;
            }, new static);
        });

        // register model observers.
        $this->registerModelObservers();
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(KWApi::class, function ($app) {
            $config = config('services.kwapi');
            $credential = new Credential($config['key']);
            $credential->setEndPoint($config['endpoint']);
            return new KWApi($credential);
        });
    }

    /**
     * register model observer.
     *
     * @return void.
     */
    private function registerModelObservers()
    {

        InteractionEloquent::observe(InteractionObserver::class);
        PersonEloquent::observe(PersonObserver::class);
        TaskEloquent::observe(TaskObserver::class);
        NoteEloquent::observe(NoteObserver::class);
        PersonAddressEloquent::observe(PersonAddressObserver::class);
        PersonEmailEloquent::observe(PersonEmailObserver::class);
        PersonPhoneEloquent::observe(PersonPhoneObserver::class);
        PersonFamilyEloquent::observe(PersonFamilyObserver::class);
        PersonIdentifierEloquent::observe(PersonIdentifierObserver::class);
        PersonLoginEloquent::observe(PersonLoginObserver::class);
        PersonScoreEloquent::observe(PersonScoreObserver::class);
        PersonSocialAccountEloquent::observe(PersonSocialAccountObserver::class);
        ObjectCustomFieldEloquent::observe(ObjectCustomFieldObserver::class);
        PreferenceEloquent::observe(PreferenceObserver::class);
        CompanyEloquent::observe(CompanyObserver::class);
        UserEloquent::observe(UserObserver::class);
        TagEloquent::observe(TagObserver::class);
    }

    /**
     * Provide service from configuration
     */
    private function provideService(array $providers)
    {
        foreach ($providers as $key => $value) {
            $this->app->bind($key, $value);
        }
    }
}
