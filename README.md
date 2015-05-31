# buck-deferred
Lightweight replacer for jQuery deferreds

## How to install?
**buck-deferred** is available in **bower**:
```
bower install buck-deferred --save-dev
```

## Why?
I like [jQuery.Deferred](https://api.jquery.com/category/deferred-object/). Seriously. But after some investigation I've found out that jQuery.Deferred has some performance problems. Most of them are caused by a wide jQuery support which is not necessary for me.

## The result
As a result I've created my own **buck-deferred** - objects that repeat jQuery.Deferred API but are based on Class-Object architecture and lack of any dependecies.

For easier usage it was decided to override current jQuery.Deffered implementation. It means that all you need is just add reference to **buck-deferred** AFTER reference to jQuery. No need to change your existing code. If there's no jQuery - **$** object will be created in the global object with **Deferred** function-constructor in it.

## So what?
Here're the results of performance test (could be found in *perf* directory). I can't be sure that my test covers all cases and **buck-deferred** is always better than jQuery.Deferred so any help in analysis is much appreciated.
![alt text](https://raw.githubusercontent.com/kirilknysh/buck-deferred/master/perf/results.png "Performance test results")