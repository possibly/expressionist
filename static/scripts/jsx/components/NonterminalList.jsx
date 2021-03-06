var React = require('react')
var Nonterminal = require('./Nonterminal.jsx')
var ListGroupItem = require('react-bootstrap').ListGroupItem
var ListGroup = require('react-bootstrap').ListGroup
var Glyphicon = require('react-bootstrap').Glyphicon
var ajax = require('jquery').ajax

class NonterminalList extends React.Component {
    
    constructor(props) {
        super(props);
        this.addNonterminalUpdate = this.addNonterminalUpdate.bind(this);
        this.clickNonterminalUpdate = this.clickNonterminalUpdate.bind(this);
        this.updateList = this.updateList.bind(this);
        this.getList = this.getList.bind(this);
        this.formatList = this.formatList.bind(this);
        this.addNonterminal = this.addNonterminal.bind(this);
        this.state = {
            searchVal: ''
        }
    }

    addNonterminalUpdate(nonterminal){
        this.props.updateFromServer();
        this.props.updateCurrentNonterminal(nonterminal);
        this.props.updateHistory(nonterminal, -1);
    }

    clickNonterminalUpdate(position) {
        if (this.props.nonterminals[position]) {
            this.props.updateCurrentNonterminal(position);
            this.props.updateCurrentRule(-1);
            this.props.updateMarkupFeedback([]);
            this.props.updateExpansionFeedback("");
            this.props.updateHistory(position, -1);
        }
    }

    updateList(e) {
        this.setState({'searchVal': e.target.value})
    }

    // returns an array of nonterminal names that match state.searchVal.
    getList() {
        var names = Object.keys(this.props.nonterminals);
        if (this.state.searchVal == ''){ 
            return names
        }
        else if (this.state.searchVal == '*'){
            return names.filter( (name) => {
                return this.props.nonterminals[name].deep == true;
            })
        }
        return names.filter( (name) => {
            var res = name.indexOf(this.state.searchVal);
            if (res != -1){ return true; }
            return false;
        })
    }

    // returns a sorted array of nonterminal names.
    formatList(nonterminals) { // nonterminals = array of nonterminal names
        var anyDeepTerminals = nonterminals.filter((name) => this.props.nonterminals[name].deep == true);
        if (!anyDeepTerminals || this.state.searchVal == '*'){
            return nonterminals.sort();
        }
        // remove deep nonterminals
        nonterminals = nonterminals.filter((name) => this.props.nonterminals[name].deep == false).sort();
        // add the searched-for deep nonterminals to the top of the list.
        var deeps = [];
        var propsNonterminals = Object.values(this.props.nonterminals);
        for (var i = 0; i < propsNonterminals.length; i++){
            var name = Object.keys(this.props.nonterminals)[i];
            // only keep nonterminals that are deep and are being searched for.
            if (propsNonterminals[i].deep == true && name.indexOf(this.state.searchVal) != -1){
                deeps.push(Object.keys(this.props.nonterminals)[i]);
            }
        }
        return deeps.concat(nonterminals);
    }

    addNonterminal() {
        var nonterminal = window.prompt("Please enter Nonterminal Name")
        if (nonterminal == '') {
            return window.alert('Please enter a name for the new nonterminal.')
        }
        else if (this.props.nonterminals[nonterminal]) {
            return window.alert('No duplicate names for nonterminals.')
        }
        ajax({
            url: $SCRIPT_ROOT + '/api/nonterminal/add',
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({'nonterminal': nonterminal}),
            async: false,
            cache: false
        })
        this.addNonterminalUpdate(nonterminal);
    }

    render() {
        var nonterminals = this.formatList(this.getList());
        return (
            <div>
                <ListGroup id='nonterminalList'>
                    <ListGroupItem bsSize='xsmall' key='nonterminalListSearchGroupItem'>
                        <input  id='nonterminalListSearch' 
                                type='text' 
                                onChange={this.updateList} 
                                value={this.state.searchVal}
                                style={{'width': '100%'}}
                                placeholder='Filter by symbol name'/>
                    </ListGroupItem>
                    {   nonterminals.map((name) => {
                            var complete = this.props.nonterminals[name].complete;
                            var deep = this.props.nonterminals[name].deep;
                            return (
                                <Nonterminal    name={name}
                                                complete={complete}
                                                deep={deep} 
                                                onClick={this.clickNonterminalUpdate.bind(this, name)} 
                                                key={name}>
                                    {name}
                                </Nonterminal>
                            )
                        })
                    }
                    <ListGroupItem bsSize="xsmall" key="ADDNEW" onClick={this.addNonterminal}>
                        <Glyphicon glyph="plus"/>
                    </ListGroupItem>

                </ListGroup>
            </div>
        );
    }
}

module.exports = NonterminalList;
