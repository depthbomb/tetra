<meta name="config" content="{{ $spa_config }}">

@asset('app.ts')
@modulepreload()
@stack('head:js')

@asset('app.css')
@stack('head:css')

@stack('head')
