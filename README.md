# KlCalculate

Calculate billing document

## Installation

Run `npm i kl-calculate --save`

## Use of

```
import { KlCalculateModule } from 'kl-calculate';

imports: [ KlCalculateModule ]
```


```
import { KlCalculateService } from 'kl-calculate';


constructor(private klCalculateService: KlCalculateService) {}

this.klCalculateService(access_token, workingPeriodId, api_url, data);
```

