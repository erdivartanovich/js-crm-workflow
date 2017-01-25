# hydrogen-crm-workflow
Workflow repository for Hydrogen CRM

Please read carefully before you start working.

## Requirement
- PHP 7
- [Elasticsearch >= 2.3.0](https://www.elastic.co/downloads/elasticsearch)
- Mysql 5.7.*
- Libcurl

## Important Notification for Development

1. Use GIT for version control. See "How to use GIT" section below.
2. Create as many unit test as we can.
3. Create clean, well-commented code.

#### By composer

- Clone git repository.
``` sh
$ git clone https://github.com/KWRI/hydrogen-crm-workflow.git
```
- Install libraries (in document root, "/hydrogen-crm-workflow")
``` sh
$ composer install
```
- Create ".env" file from ".env.example" and adjust values
- run schema migration & database seeder
``` sh
$ php artisan migrate:refresh --seed
$ php artisan es:refresh
```
