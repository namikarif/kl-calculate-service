# KlCalculate

Calculate billing document

## Installing

```
$ npm install kl-calculate --save
```

## Example
### Import Module

```js
import { KlCalculateModule } from 'kl-calculate';

imports: [ KlCalculateModule ]
```

### Usage in Component
```js
import { KlCalculateService } from 'kl-calculate';


constructor(private klCalculateService: KlCalculateService) {}

this.klCalculateService.calculateAndPost(access_token, workingPeriodId, api_url, data);
```

