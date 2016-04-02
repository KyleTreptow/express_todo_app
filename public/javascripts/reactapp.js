console.log('React App Connected! - Dooty3');
// React Transition Group
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;


/////////////////////////////////////////////////////////
// 0.0 Index Layout - Top Level Component
/////////////////////////////////////////////////////////
var IndexLayout = React.createClass({
    getInitialState: function(){
      return {
          userlist: [],
          activeUser: []
      };
    },
    getData: function(url, resetID){  
      $.get(url, function(result) {
        if (this.isMounted()) {
          this.setState({
            userlist: result
          });
          console.log('Ajax Call Made!');
          // If resetID has an argument - call update
          if(resetID){
            // Show current user
            this.showUserDetails(resetID);
          }
        }
      }.bind(this));
    },
    postData: function(newData){
      // POST VIA AJAX
      //alert(newData);

      var that = this;

      $.ajax({
            type: 'POST',
            data: newData,
            url: '/users/adduser',
            dataType: 'JSON'
      }).done(function( response ) {
            // Check for successful (blank) response
            if (response.msg === '') {
                // Clear the form inputs
                $('#addUserForm input, #addUserForm textarea').val('');
                console.log('Post Succesful, NewID: '+response.new_userid);
                that.getData('/users/userlist', response.new_userid);
            }
            else {
                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
            }
        });

      // Re-Get data
      //this.getData('/users/userlist');
    },
    updateData: function(postID, newData){
      // POST VIA AJAX
      
      var that = this;

      $.ajax({
            type: 'POST',
            data: newData,
            url: '/users/updateuser/' + postID,
            dataType: 'JSON'
      }).done(function( response ) {
            // Check for successful (blank) response
            if (response.msg === '') {
                // Clear the form inputs
                $('#updateUserForm input, #updateUserForm textarea').val('');
                console.log('Post Update Succesful');
                
                // Re-Get data - call a reset on the details panel
                that.getData('/users/userlist', postID);
                // Set active user to Null
                that.setState({ activeUser: [] });

            }
            else {
                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
            }
        });
    },
    showUserDetails: function(userID){
      // Get Index of object based on id value
      var arrayPosition = this.state.userlist.map(function(arrayItem) {
          return arrayItem._id; 
     }).indexOf(userID);

      this.setState({ activeUser: this.state.userlist[arrayPosition] });

      console.log('Showing User Details');
    },
    deleteUser: function(userID){

      var that = this;
      // Pop up a confirmation dialog
      var confirmation = confirm('Are you sure you want to delete this user?');
      // Check and make sure the user confirmed
      if (confirmation === true) {
          // If they did, do our delete
          $.ajax({
              type: 'DELETE',
              url: '/users/deleteuser/' + userID
          }).done(function( response ) {
              // Check for a successful (blank) response
              if (response.msg === '') {
                console.log('Delete Successful');
                // Re-Get data
                that.getData('/users/userlist');
              }
              else {
                  alert('Error: ' + response.msg);
              }   
          });
          //add codition - if deleted user is active...
          this.setState({ activeUser: [] });
      }
      else {
          // If they said no to the confirm, do nothing
          return false;
      }
    },
    componentDidMount: function() {
      console.log('IndexTemplate Mounted');
      this.getData('/users/userlist');
      this.setState({ currentdetails: this.state.userlist[0] });
    },
    render: function(){
      return (
        <div id='index-layout-inner'>
          <header id='app-header'>
            <nav>
              <ul className="list-inline">
                <li>Logo Here</li>
                <li>
                  <button type="button" className="btn btn-success" data-toggle="modal" data-target="#myModal">
                    <i className="fa fa-star-o"></i> New User
                  </button>
                  <button type="button" className="btn btn-info disabled">
                    <i className="fa fa-comment"></i> Chat
                  </button>
                  <button type="button" className="btn btn-primary disabled">
                    <i className="fa fa-list"></i> View Options
                  </button>
                </li>
              </ul>
            </nav>
          </header>
          <section id="app-body">
                    <div className='leftcol' id="userlist-col">
                        <div className="inner">
                        <h2>User List</h2>
                        <UserTable userlist={this.state.userlist} parent={this} />
                        </div>
                    </div>
                    <div className='rightcol' id="userdetails-col">
                        <div className="inner">       
                            <UserDetails userInfo={ this.state.activeUser } parent={this} /> 
                        </div>
                    </div>
          </section>
          <UserForm parent={this} />
          <UserUpdateForm parent={this} userInfo={ this.state.activeUser } />
        </div>
      );
    }
});



/////////////////////////////////////////////////////////
// 1.0 User Table - child component
/////////////////////////////////////////////////////////
var UserTable = React.createClass({
  getInitialState: function() {
    return { };
  },
  componentDidMount: function() {
    console.log('UserTable Mounted');
  },
  render: function(){
    var that = this;
    return (
      <ul id='table-of-users'>
        <li className='user-item-name add-user-btn'>
        <p><button type="button" className="btn btn-success" data-toggle="modal" data-target="#myModal">
                    <h4><i className="fa fa-plus"></i> Add a New User</h4>
        </button></p></li>
        {this.props.userlist.map(function(item, i){
          return(
            <li key={item._id} className='user-item-name'>
                  <p><button onClick={ that.props.parent.showUserDetails.bind(this, item._id) } className='btn btn-info'>
                    <h4>{item.username}</h4>
                  </button></p>
            </li>
          );        
        })}
      </ul>
    );
  }
});

/////////////////////////////////////////////////////////
// 2.0 User Details - child component
/////////////////////////////////////////////////////////
var UserDetails = React.createClass({
  getInitialState: function(){
     return { };
  },
  componentDidMount: function(){
      console.log('UserDetails mounted');
  },
  render: function(){
    if( this.props.userInfo._id ){
        // Show User Details
        return(
          <div id="user-details-wrap">
          <ReactCSSTransitionGroup transitionName="example" transitionEnterTimeout={600} transitionLeaveTimeout={200}>
          <div id="user-details-panel" className="well" key={this.props.userInfo._id}>
              <dl>
                  // Add to obj queue
                  <dt>ID: </dt><dd>{ this.props.userInfo._id ? this.props.userInfo._id : 'No Data Available' }</dd>
                  <dt>Username: </dt><dd>{ this.props.userInfo.username ? this.props.userInfo.username : 'No Data Available' }</dd>
                  <dt>Full Name: </dt><dd>{ this.props.userInfo.fullname ? this.props.userInfo.fullname : 'No Data Available'  }</dd>
                  <dt>Email: </dt><dd>{ this.props.userInfo.email ? this.props.userInfo.email : 'No Data Available'  }</dd>
                  <dt>Age: </dt><dd>{ this.props.userInfo.age ? this.props.userInfo.age : 'No Data Available'  }</dd>
                  <dt>Location: </dt><dd>{ this.props.userInfo.location ? this.props.userInfo.location : 'No Data Available'  }</dd>
                  <dt>Gender: </dt><dd>{ this.props.userInfo.gender ? this.props.userInfo.gender : 'No Data Available'  }</dd>
                  <dt>Bio: </dt><dd>{ this.props.userInfo.bio ? this.props.userInfo.bio : 'No Data Available'  }</dd>
              </dl>
              <ul className='list-inline'>
                  <li>
                      <button className='btn btn-success' data-toggle="modal" data-target="#userUpdateModal">
                          <i className='fa fa-pencil'></i>
                      </button>
                  </li>
                  <li>
                      <button onClick={ this.props.parent.deleteUser.bind(this, this.props.userInfo._id ) } className='btn btn-danger'>
                          <i className='fa fa-times'></i>
                      </button>   
                  </li>
              </ul>
          </div>
          </ReactCSSTransitionGroup>
          </div>
        );
    } else {
        // Blank 
        return (
          <div id="user-details-wrap">
          <ReactCSSTransitionGroup transitionName="example" transitionEnterTimeout={600} transitionLeaveTimeout={200}>
          <div id="user-details-panel" className="well" key={0}>
              <p>Nothing to see here</p>
          </div>
          </ReactCSSTransitionGroup>
          </div>
        );
    }
  }
});

/////////////////////////////////////////////////////////
// 3.0 User Form - child component
/////////////////////////////////////////////////////////
var UserForm = React.createClass({
  getInitialState: function(){
     return { };
  },
  componentDidMount: function(){
      console.log('UserForm mounted');
  },

  formSubmit: function(){
    console.log('Form Submitted');

    //validation
    var errorCount = 0;
    $('#addUserForm input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    if(errorCount === 0) {
      // If it is, compile all user info into one object
        var newUser = {
            'username': $('#addUserForm input#username').val(),
            'fullname': $('#addUserForm input#fullname').val(),
            'email': $('#addUserForm input#useremail').val(),
            'age': $('#addUserForm input#userage').val(),
            'location': $('#addUserForm input#userlocation').val(),
            'gender': $('#addUserForm input#usergender').val(),
            'bio': $('#addUserForm textarea#userbio').val()
        }
      // Call the postData method from the parent component
      this.props.parent.postData(newUser);

      // Close Modal
      $('#myModal').modal('hide');

    } else {
        // Return Error
        alert('Please fill in all fields');
        return false;
    }
  },
  render: function(){
    return(
      <div className="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
          <div className="modal-dialog" role="document">
              <div className="modal-content">
                  <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span></button>
                      <h4 className="modal-title" id="myModalLabel">Add a New User</h4>
                  </div>
              <div className="modal-body">
              <form id="addUserForm">
                  <div className='form-group'>
                      <label for='username'>Username</label>
                      <input type='text' className='form-control' id='username' placeholder='Username' />
                  </div>
                  <div className='form-group'>
                      <label for='fullrname'>Full Name</label>
                      <input type='text' className='form-control' id='fullname' placeholder='Full Name' />
                  </div>
                  <div className='form-group'>
                      <label for='useremail'>Email</label>
                      <input type='text' className='form-control' id='useremail' placeholder='Email' />
                  </div>
                  <div className='form-group'>
                      <label for='userage'>Age</label>
                      <input type='text' className='form-control' id='userage' placeholder='Age' />
                  </div>
                  <div className='form-group'>
                      <label for='userlocation'>Location</label>
                      <input type='text' className='form-control' id='userlocation' placeholder='Location' />
                  </div>
                  <div className='form-group'>
                      <label for='usergender'>Gender</label>
                      <input type='text' className='form-control' id='usergender' placeholder='Gender' />
                  </div> 
                  <div className='form-group'>
                      <label for='userbio'>Bio</label>
                      <textarea rows='4' className='form-control' id='userbio' 
                      placeholder='Bio' />
                  </div>
              </form>
              </div>
              <div className="modal-footer row">
                      <div className="col-xs-6 col-sm-6 left">
                          <button onClick={this.formSubmit} type='button' className='btn btn-success btn-lg'>Submit</button>
                      </div>
                      <div className="col-xs-6 col-sm-6 right">
                          <button type="button" className="btn btn-danger btn-lg" data-dismiss="modal">Close</button>
                      </div>
              </div>
              </div>
          </div>
      </div> 
    );
  }
});


/////////////////////////////////////////////////////////
// 4.0 User Update Form - child component
/////////////////////////////////////////////////////////

var UserUpdateForm = React.createClass({
  getInitialState: function(){
     return { };
  },
  componentDidMount: function(){
      console.log('User Update Form mounted');
  },

  formSubmit: function(currentUserObj) {
    console.log( 'Update Form Submitted: ID#'+currentUserObj._id );

    // validation - make sure at least one field has a value
    // count inputs and errors - compare counts
    var errorCount = 0;
    var inputCount = 0;
    $('#updateUserForm input, #updateUserForm textarea').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
        inputCount++; 
    });
    //console.log('Input Count: '+inputCount);
    //console.log('Error Count: '+errorCount);

    if(errorCount != inputCount) {
        // Get all form values
        var newUsername = $('#updateUserForm input#updateusername').val();
        var newFullname = $('#updateUserForm input#updatefullname').val();
        var newUseremail = $('#updateUserForm input#updateuseremail').val();
        var newUserage = $('#updateUserForm input#updateuserage').val();
        var newUserlocation = $('#updateUserForm input#updateuserlocation').val();
        var newUsergender = $('#updateUserForm input#updateusergender').val();
        var newUserbio = $('#updateUserForm textarea#updateuserbio').val();
        // Check for new username val - otherwise use old
        var updatedUsername = newUsername ? newUsername : currentUserObj.username; 
        var updatedFullname = newFullname ? newFullname : currentUserObj.fullname;
        var updatedUseremail = newUseremail ? newUseremail : currentUserObj.email;
        var updatedUserage = newUserage ? newUserage : currentUserObj.age;
        var updatedUserlocation = newUserlocation ? newUserlocation : currentUserObj.location;
        var updatedUsergender = newUsergender ? xnewUsergender : currentUserObj.gender;
        var updatedUserbio = newUserbio ? newUserbio : currentUserObj.bio;
        // Create obect of updated info
        var updatedUser = {
            'username': updatedUsername,
            'fullname': updatedFullname,
            'email': updatedUseremail,
            'age': updatedUserage,
            'location': updatedUserlocation,
            'gender': updatedUsergender,
            'bio': updatedUserbio
        }
      // Call the updateData method from the parent component
      console.log(updatedUser);
      this.props.parent.updateData(currentUserObj._id, updatedUser);
      

      // Close Modal
      $('#userUpdateModal').modal('hide');

    } else {
        // Return Error
        alert('Please fill in at least one field');
        return false;
    }
  },
  render: function(){

    var activeUserObj = null;
    var activeUname = 'No User Selected';
    var activeID = null;

    if(this.props.userInfo){
        activeUname = this.props.userInfo.username;
        activeID = this.props.userInfo._id;
        activeUserObj = this.props.userInfo;
    }

    return(
      <div className="modal fade" id="userUpdateModal" tabindex="-1" role="dialog" aria-labelledby="userUpdateModalLabel">
          <div className="modal-dialog" role="document">
              <div className="modal-content">
                  <div className="modal-header">
                      <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                      <h4 className="modal-title" id="userUpdateModalLabel">Update User: { activeUname }</h4>
                  </div>
              <div className="modal-body">
              <form id="updateUserForm">
                  <div className='form-group'>
                      <label for='updateusername'>Username</label>
                      <input type='text' className='form-control' id='updateusername' 
                      placeholder={ activeUserObj.username ? activeUserObj.username : 'Username'} />
                  </div>
                  <div className='form-group'>
                      <label for='updatefullrname'>Full Name</label>
                      <input type='text' className='form-control' id='updatefullname' 
                      placeholder={ activeUserObj.fullname ? activeUserObj.fullname : 'Full Name'} />
                  </div>
                  <div className='form-group'>
                      <label for='updateuseremail'>Email</label>
                      <input type='text' className='form-control' id='updateuseremail' 
                      placeholder={ activeUserObj.email ? activeUserObj.email : 'Email'} />
                  </div>
                  <div className='form-group'>
                      <label for='updateuserage'>Age</label>
                      <input type='text' className='form-control' id='updateuserage' 
                      placeholder={ activeUserObj.age ? activeUserObj.age : 'Age'} />
                  </div>
                  <div className='form-group'>
                      <label for='updateuserlocation'>Location</label>
                      <input type='text' className='form-control' id='updateuserlocation' 
                      placeholder={ activeUserObj.location ? activeUserObj.location : 'Location'} />
                  </div>
                  <div className='form-group'>
                      <label for='updateusergender'>Gender</label>
                      <input type='text' className='form-control' id='updateusergender' 
                      placeholder={ activeUserObj.gender ? activeUserObj.gender : 'Gender'} />
                  </div> 
                  <div className='form-group'>
                      <label for='updateuserbio'>Bio</label>
                      <textarea rows='4' className='form-control' id='updateuserbio' 
                      placeholder={ activeUserObj.bio ? activeUserObj.bio : 'Bio'} />
                  </div> 
              </form>
              </div>
              <div className="modal-footer row">
                      <div className="col-xs-6 col-sm-6 left">
                          <button onClick={this.formSubmit.bind(this, activeUserObj) } type='button' className='btn btn-success btn-lg'>Submit</button>
                      </div>
                      <div className="col-xs-6 col-sm-6 right">
                          <button type="button" className="btn btn-danger btn-lg" data-dismiss="modal">Close</button>
                      </div>
              </div>
              </div>
          </div>
      </div> 
    );
  }
});



/////////////////////////////////////////////////////////
// 0.0 Render the App
/////////////////////////////////////////////////////////
ReactDOM.render(
  <IndexLayout />,
  document.getElementById('index-layout')
);