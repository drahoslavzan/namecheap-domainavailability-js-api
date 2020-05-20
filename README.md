## NameCheap Domain Availability API (JS)

## Usage

```javascript
import NameCheapApi from '../scripts/NameCheapApi';
...

class DomainInput extends Component {
    onStatus = (domain, status, error) => {
        const { updateStatus } = this.props;

        updateStatus(domain, status, error);
    }

    _check = list => {
        const { populateDomains } = this.props;

        const domains = this._api.check(list);

        if (!domains.length) return;

        populateDomains(domains);
    }

    componentDidMount() {
        this._api = new NameCheapApi(this.onStatus);
    }

    render() {
        const { classes } = this.props;

        return (
            <div className={classes.root}>
                <this.props.Input limit={NameCheapApi.limit} check={this._check} />
            </div>
        );
    }
};
...
```

## LICENSE
MIT
