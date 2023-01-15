<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="ltr" class="www">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>go.super.fish</title>
        @include('layouts/_head')
    </head>
    <body>
        @yield('content', 'Missing client entry point')
        @include('layouts/_foot')
    </body>
</html>
