# notable 
* Backend implemented using node.js, express, and mongodb

### Installation Instructions
1. Backend
  - Customize config.json
  - `npm install`
  - Create "notable" database with two collections:
  		- ***videos***, initialized as follows:

```
{
    "name" : {
        "first" : "Julius",
        "last" : "Hibbert"
    }
}

{
    "name" : {
        "first" : "Algernop",
        "last" : "Krieger"
    }
}

{
    "name" : {
        "first" : "Nick",
        "last" : "Riviera"
    }
}
```
  		- ***appointments*** - No need to initialize

### Execution Instructions

1. Execute the code, e.g. `$ nodemon`
2. Kill w/ `CTRL+c` or `kill`
