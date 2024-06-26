'use strict';
/* Global variable used to keep track of whether the ValidateForm component
needs updating */
let reRenderValidate = true;

// Form for uploading documents to be validated
// eslint-disable-next-line no-undef
class ValidateForm extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            fileId: '',
            documentDropDown: []
        };
        this.handleSubmit = this.HandleSubmit.bind(this);
        this.handleDropDownChange = this.HandleDropDownChange.bind(this);
        // eslint-disable-next-line no-undef
        this.fileInput = React.createRef();
    }
    // Submits a file to be validated against a selected existing document
    HandleSubmit(event)
    {
        event.preventDefault();
        const form = new FormData();
        form.append('id', this.state.fileId);
        form.append('file', this.fileInput.current.files[0]);
        // eslint-disable-next-line no-undef
        axios.put('/api/verify', form,
            {
                headers:
                {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(res =>
            { // If the response status is 200
                if(res.status === 200 && '' in res.data)
                {
                    /* And the document is verified succesfully,
                    render validateSuccess */
                    if(res.data.verifySuccess)
                    {
                        this.props.OnDisplayChange('validateSuccess');
                    }
                    /* If the document could not be verified,
                    render validateFailure */
                    else
                    {
                        this.props.OnDisplayChange('validateFailure');
                    }
                }
                // If the response was not 200, render validateError
                else
                {
                    this.props.OnDisplayChange('validateError');
                }
            })
            .catch(() =>
            { // Any other error encountered will render validateError
                this.props.OnDisplayChange('validateError');
            });
    }
    // Changes the selected file Id whenever a dropdown option is selected
    HandleDropDownChange(event)
    {
        this.setState({fileId: event.target.value});
    }
    // Runs on component load to get the list of currently anchored documents
    componentDidMount()
    {
        this.GetUpdatedList();
    }
    // Runs on component update to get the list of currently anchored documents
    componentDidUpdate()
    {
        this.GetUpdatedList();
    }
    // Gets the updated list of documents
    GetUpdatedList()
    {
        // Make a get request to get the list of documents that are anchored
        if (reRenderValidate == true)
        {
            reRenderValidate = false;
            // eslint-disable-next-line no-undef
            axios.get('/api/list')
            // Then map the documents into option elements for a dropdown menu
                .then(res =>
                {
                    const documentJSON = res.data;
                    this.setState({documentDropDown: documentJSON.map((e, key) =>
                    {
                        return (
                            <option key={key} value={e._id}>[{e._id}]
                                {e.documentName}</option>
                        );
                    }
                    )});
                    /* Update the dropdown menu to display the name of the file
                    with its id number */
                    if (res.data.length > 0)
                    {
                        this.setState({fileId: res.data[0].id});
                    }
                })
                .catch(error =>
                {
                    // If request to route was unsuccesfull, output an error
                    console.error(
                        'There was an error getting the list of documents\n',
                        error);
                });
        }
    }

    render()
    {
        return (
            <form onSubmit={this.handleSubmit}>
                <br></br>
                <label>Upload the file you wish to validate:{'\n'}
                    <input type="file" ref={this.fileInput} />
                </label>
                <br></br>
                <button type="submit" className="btn btn-outline-info text-center" >Validate</button>
            </form>
        );
    }
}
ValidateForm.propTypes =
{
    // eslint-disable-next-line no-undef
    OnDisplayChange: PropTypes.func,
};

// Form for uploading documents to be anchored
// eslint-disable-next-line no-undef
class AnchorForm extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            fileName: '',
        };
        this.handleChange = this.HandleChange.bind(this);
        this.handleSubmit = this.HandleSubmit.bind(this);
        // eslint-disable-next-line no-undef
        this.fileInput = React.createRef();
    }

    HandleChange(event)
    {
        this.setState({fileName: event.target.value});
    }

    /* When form is submitted, this function sends the file to the server with
    an axios request*/
    HandleSubmit(event)
    {
        event.preventDefault();
        this.setState({uploadedFile: this.fileInput.current.files[0]});
        // Upload the file and change display
        const form = new FormData();
        form.append('name', this.state.fileName);
        form.append('file', this.fileInput.current.files[0]);
        // eslint-disable-next-line no-undef
        axios.post('/api/upload', form,
            {
                headers:
                {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(res =>
            { /* If the response status is 200, render AnchorSucess */
                console.log(res.status);
                if(res.status == '200')
                {
                    console.log(res.data.id);
                    this.props.OnAnchorSuccess(res.data.id);
                    this.props.OnDisplayChange('anchorSuccess');
                }
            })
            .catch(error =>
            { // If the response was outside of 2xx, render AnchorFailure
                if(error.response)
                {
                    this.props.OnDisplayChange('anchorFailure');
                }
            });
    }
    // Displays a form for uploading a file and entering a custom file name
    render()
    {
        return (
            <form onSubmit={this.handleSubmit}>
               
                <br></br>
                <label>File to be uploaded:
                    <input type="file" ref={this.fileInput} />
                </label>
                <br></br>
                <button type="submit" className="btn btn-outline-info">Upload</button>
            </form>
        );
    }
}
AnchorForm.propTypes =
{
    // eslint-disable-next-line no-undef
    OnDisplayChange: PropTypes.func,
    // eslint-disable-next-line no-undef
    OnAnchorSuccess: PropTypes.func,
};

// Renders on page if an uploaded document was succesfully anchored
// eslint-disable-next-line no-undef
class AnchorSuccess extends React.Component
{
    constructor(props)
    {
        super(props);
        this.handleClick = this.HandleClick.bind(this);
    }
    HandleClick()
    {
        this.props.OnDisplayChange('anchorForm');
    }
    render()
    {
        console.log(this.props.anchoredDocId);
        return (
            <div className="anchorSuccess">
                <h6>Upload Successful</h6>
                <p>
                    Your document has been successfully uploaded.
                    Future attempts to validate this file will be successful.
                </p>
                <button onClick={this.handleClick}
                    className="btn btn-outline-info" >Anchor Another Document
                </button>
            </div>
        );
    }
}
AnchorSuccess.propTypes =
{
    // eslint-disable-next-line no-undef
    OnDisplayChange: PropTypes.func,
    // eslint-disable-next-line no-undef
    anchoredDocId: PropTypes.string,
};

// Renders on page if an uploaded document could not be anchored
// eslint-disable-next-line no-undef
class AnchorFailure extends React.Component
{
    constructor(props)
    {
        super(props);
        this.handleClick = this.HandleClick.bind(this);
    }
    HandleClick()
    {
        this.props.OnDisplayChange('anchorForm');
    }
    render()
    {
        return (
            <div className="anchorFailure">
                <h6>Upload Failed</h6>
                <p>
                    Your document could not be uploaded, make sure that you
                    attached a file and entered a name for it.
                    If you still have problems,
                    contact your system administrator.
                </p>
                <button onClick={this.handleClick}
                    className="btn btn-outline-info" >Try Again</button>
            </div>
        );
    }
}
AnchorFailure.propTypes =
{
    // eslint-disable-next-line no-undef
    OnDisplayChange: PropTypes.func,
};

// Renders on page if uploaded document was succesfully validated
// eslint-disable-next-line no-undef
class ValidateSuccess extends React.Component
{
    constructor(props)
    {
        super(props);
        this.handleClick = this.HandleClick.bind(this);
    }
    HandleClick()
    {
        this.props.OnDisplayChange('validateForm');
    }
    render()
    {
        return (
            <div className="validateSuccess">
                <h6>Validation Successful</h6>
                <p>Your document is valid</p>
                <button onClick={this.handleClick}
                    className="btn btn-outline-info" >Validate Another Document
                </button>
            </div>
        );
    }
}
ValidateSuccess.propTypes =
{
    // eslint-disable-next-line no-undef
    OnDisplayChange: PropTypes.func,
};

// Renders on page if the uploaded document could not be validated
// eslint-disable-next-line no-undef
class ValidateFailure extends React.Component
{
    constructor(props)
    {
        super(props);
        this.handleClick = this.HandleClick.bind(this);
    }
    HandleClick()
    {
        this.props.OnDisplayChange('validateForm');
    }
    render()
    {
        return (
            <div className="validateFailure">
                <h6>Document is Invalid</h6>
                <p>
                    Sorry, we couldn&apos;t validate your document.
                    Your file may never have been uploaded to the validation
                    system, or may be a doctored form of the true document.
                </p>
                <button onClick={this.handleClick}
                    className="btn btn-outline-info" >Try Again</button>
            </div>
        );
    }
}
ValidateFailure.propTypes =
{
    // eslint-disable-next-line no-undef
    OnDisplayChange: PropTypes.func,
};

// Renders on page if response from route was not 200
// eslint-disable-next-line no-undef
class ValidateError extends React.Component
{
    constructor(props)
    {
        super(props);
        this.handleClick = this.HandleClick.bind(this);
    }
    HandleClick()
    {
        this.props.OnDisplayChange('validateForm');
    }
    render()
    {
        return (
            <div className="validateError">
                <h6>Validation Error</h6>
                <p>There was an error validating your document</p>
               
            </div>
        );
    }
}
ValidateError.propTypes =
{
    // eslint-disable-next-line no-undef
    OnDisplayChange: PropTypes.func,
};

// Parent Anchor component which renders an anchor form or success/fail states
// eslint-disable-next-line no-undef
class AnchorWrapper extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            display: 'anchorForm',
            anchoredDocId: '',
        };
        this.handleDisplayChange = this.HandleDisplayChange.bind(this);
        this.handleAnchorSuccess = this.HandleAnchorSuccess.bind(this);
    }

    /* Called by sub-components. Changes the sub-component rendered by this,
    depending on the result of certain user actions */
    HandleDisplayChange(toBeDisplayed)
    {
        this.setState({display: toBeDisplayed});
    }

    HandleAnchorSuccess(anchoredId)
    {
        console.log(anchoredId);
        this.setState({anchoredDocId: anchoredId});
        console.log(this.state.anchoredDocId);
    }

    render()
    {
        // Check the state to determine which div to render
        switch(this.state.display)
        {
        case 'anchorSuccess':
            return (
                <div>
                    <AnchorSuccess OnDisplayChange={this.handleDisplayChange}
                        anchoredDocId={this.state.anchoredDocId}
                    />
                </div>
            );
        case 'anchorFailure':
            return (
                <div>
                    <AnchorFailure OnDisplayChange={this.handleDisplayChange} />
                </div>
            );
            // Default state is rendering AnchorForm
        default:
            return (
                <div>
                    <AnchorForm OnDisplayChange={this.handleDisplayChange}
                        OnAnchorSuccess={this.handleAnchorSuccess}
                    />
                </div>
            );
        }
    }
}

// Parent component which renders a validation form or success/failure states
// eslint-disable-next-line no-undef
class ValidateWrapper extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            display: 'validateForm',
        };
        this.handleDisplayChange = this.handleDisplayChange.bind(this);
    }

    /* Called by sub-components. Changes the sub-component rendered by this,
    depending on the result of certain user actions */
    handleDisplayChange(toBeDisplayed)
    {
        this.setState({display: toBeDisplayed});
    }

    render()
    {
        // Check the state to determine which div to render
        switch(this.state.display)
        {
        case 'validateSuccess':
            return (
                <div>
                    <ValidateSuccess OnDisplayChange={this.handleDisplayChange} />
                </div>
            );
        case 'validateFailure':
            return (
                <div>
                    <ValidateFailure OnDisplayChange={this.handleDisplayChange} />
                </div>
            );
        case 'validateError':
            return (
                <div>
                    <ValidateError OnDisplayChange={this.handleDisplayChange} />
                </div>
            );
            //  Default state is render ValidateForm
        default:
            return (
                <div>
                    <ValidateForm OnDisplayChange={this.handleDisplayChange} />
                </div>
            );
        }
    }
}

/* Updates the list of anchored documents in the ValidateForm component
whenever a user clicks the Validate button on index.js */
// eslint-disable-next-line
function ReRenderValidate()
{
    reRenderValidate = true;
    let validateContainer = document.querySelector('#validatemodbody');
    // eslint-disable-next-line no-undef
    ReactDOM.render(<ValidateWrapper />, validateContainer);
}

let anchorContainer = document.querySelector('#anchormodbody');
// eslint-disable-next-line no-undef
ReactDOM.render(<AnchorWrapper />, anchorContainer);
let validateContainer = document.querySelector('#validatemodbody');
// eslint-disable-next-line no-undef
ReactDOM.render(<ValidateWrapper />, validateContainer);




// Form for uploading documents to be revoked
class RevokeForm extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.fileInput = React.createRef();
    }

    handleSubmit(event) {
        event.preventDefault();
        const form = new FormData();
        form.append('file', this.fileInput.current.files[0]);
        axios.post('/api/revoke', form, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            if (res.status === 200) {
                this.props.OnRevokeSuccess(res.data.id);
                this.props.OnDisplayChange('revokeSuccess');
            }
        }).catch(error => {
            this.props.OnDisplayChange('revokeFailure');
        });
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>File to be revoked:
                    <input type="file" ref={this.fileInput} />
                </label>
                <br></br>
                <button type="submit" className="btn btn-outline-info">Revoke</button>
            </form>
        );
    }
}

RevokeForm.propTypes = {
    OnDisplayChange: PropTypes.func,
    OnRevokeSuccess: PropTypes.func,
};

// Renders on page if an uploaded document was successfully revoked
class RevokeSuccess extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.OnDisplayChange('revokeForm');
    }

    render() {
        return (
            <div className="revokeSuccess">
                <h6>Revoke Successful</h6>
                <p>
                    Your document has been successfully revoked.
                </p>
                <button onClick={this.handleClick} className="btn btn-outline-info">Revoke Another Document</button>
            </div>
        );
    }
}

RevokeSuccess.propTypes = {
    OnDisplayChange: PropTypes.func,
};

// Renders on page if an uploaded document could not be revoked
class RevokeFailure extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.OnDisplayChange('revokeForm');
    }

    render() {
        return (
            <div className="revokeFailure">
                <h6>Revoke Failed</h6>
                <p>
                    Your document could not be revoked, make sure that you
                    attached a file or maybe you don't have permission for that. 
                    If you still have problems,contact your system administrator.
                </p>
                <button onClick={this.handleClick} className="btn btn-outline-info">Try Again</button>
            </div>
        );
    }
}

RevokeFailure.propTypes = {
    OnDisplayChange: PropTypes.func,
};

class RevokeWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            display: 'revokeForm',
        };
        this.handleDisplayChange = this.handleDisplayChange.bind(this);
        this.handleRevokeSuccess = this.handleRevokeSuccess.bind(this);
    }

    handleDisplayChange(toBeDisplayed) {
        this.setState({ display: toBeDisplayed });
    }

    handleRevokeSuccess(id) {
        console.log("Revoked document ID:", id);
    }

    render() {
        switch (this.state.display) {
            case 'revokeSuccess':
                return (
                    <div>
                        <RevokeSuccess OnDisplayChange={this.handleDisplayChange} />
                    </div>
                );
            case 'revokeFailure':
                return (
                    <div>
                        <RevokeFailure OnDisplayChange={this.handleDisplayChange} />
                    </div>
                );
            default:
                return (
                    <div>
                        <RevokeForm OnDisplayChange={this.handleDisplayChange} OnRevokeSuccess={this.handleRevokeSuccess} />
                    </div>
                );
        }
    }
}

let revokeContainer = document.querySelector('#revokemodbody');
ReactDOM.render(<RevokeWrapper />, revokeContainer);
