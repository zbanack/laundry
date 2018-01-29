/**
 * Lndry
 * https://devpost.com/software/lndry
 * https://github.com/zbanack/laundry
 * @desc App frontend for showing laundromat washer and dryer availability status
  via Rasperry Pi movement detection. "If it's shakin', it's taken."
 * @author Zack Banack
 * Made for RIT BrickHack 4 <3
 * January 27, 2018
 */

/* Is this a BrickHack build? (Stuff may break if false...) */
const BRICKHACK = true;

/* For demoing, force intended values */
var piVal = 1; 

/* React */
import React, {
  Component
} from 'react';

/* React Native */
import {
  StatusBar,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  AppRegistry,
  RefreshControl
} from 'react-native'

/* Native Base */
import {
  Card,
  CardItem,
  Root,
  ActionSheet,
  Container,
  Title,
  Header,
  Left,
  Right,
  Body,
  Content,
  Item,
  List,
  ListItem,
  Separator,
  ListView,
  InputGroup,
  Input,
  Icon,
  Button,
  Text
} from 'native-base';

/* Search Filtering */
import SearchInput, {
  createFilter
} from 'react-native-search-filter';

/* Placeholder json for laundromats, *something* needs to be filtered */
import laundromats from './example_json';
import emptyLaundromats from './example_json';

/* API URL */
const API_URL = 'https://banack.me/laundry/status.json'; // url to read json (changed post-BrickHack)

/* Use laundromat name and loctaion for search filtering */
var filter_name = 'client.name';
var filter_location = 'client.location';
var KEYS_TO_FILTER = [filter_name, filter_location];

/* Button references for delete reminders */
const CLEAR_ALL_BUTTONS = ["Delete Reminders", "Cancel"];
const CLEAR_ALL_DESTRUCTIVE_INDEX = 0;
const CLEAR_ALL_CANCEL_INDEX = 1;

/* Button references for make reminders */
const MAKE_REMINDER_BUTTONS = ["Notify me when a washer becomes available", "Notify me when a dryer becomes available", "Cancel"];
const MAKE_REMINDER_CANCEL_INDEX = 2;

/* Filtered list of laundromats */
var filteredLaundromats;

/* Did we make initial call to server? */
var initial_call = false;

/* User chooses to clear all notifications. */
function clearAllNotifications() {
  alert("You have been removed from all machine-availability queues.");
  console.log('clearAllNotifications');
  //TODO: server request to remove user from list
}

/* User wants to be added to the machine-availability queue */
function setMachineNotification(machineID) {
  alert("You have been added to the queue at position #1. You'll be notified when a machine becomes available.");
  console.log('setMachineNotification, machineID = ' + machineID);
  //TODO: server request to place user into queue
}

export default class Laundry extends Component {
  /* States */
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,      // pull-down refreshing status
      searchTerm: '',         // term to search for
      toFilter: emptyLaundromats   // list to filter (json fetch return)
    };
  }

  /* Search term state */
  searchUpdated(term) {
    this.setState({searchTerm: term})
  }

  /* bool to int */
  binarify(bool) {
    return bool == true ? 1 : 0;
  }

  /* Call API */
  callAPI() {
    return fetch(API_URL)
    .then((response) => {return response.json()})
    .then((responseJson) => {
      this.setState({refreshing:false})
      /*
       * This example only uses 1 device to pull status.
       * In the path of scalability, responseJson would be an
       * actual JSON (like var 'laundromats' that our filter would utilize.
       * this.setState({toFilter:responseJson})
       **/
      BRICKHACK ? this.setState({toFilter:laundromats}) : this.setState({toFilter:responseJson})
      piVal = responseJson;
      return responseJson;
    })
    .catch((error) => {
    console.error(error);
    });
  }

  /* Pull-refresh update, call API */
  updateContent() {
    this.callAPI();
    if (BRICKHACK) piVal = 0;
    this.setState({refreshing:true});
    setTimeout(()=>{
      this.setState({refreshing:false});
    },2000);
  }

  render() {
    /* Call API immediately, once */
    if (!initial_call) {
      initial_call = true;
      this.callAPI();
    }
    StatusBar.setBarStyle('light-content', true);
    /* Filter list based on key filters */
    filteredLaundromats = this.state.toFilter.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTER))
    return (
      <Root>
        <Container>
          <Header style={styles.headerStyle}>
            <Left>
              <Button transparent onPress={() =>
                    ActionSheet.show({
                        options: CLEAR_ALL_BUTTONS,
                        cancelButtonIndex: CLEAR_ALL_CANCEL_INDEX,
                        destructiveButtonIndex: CLEAR_ALL_DESTRUCTIVE_INDEX,
                        title: "Do you want to remove yourself from all machine-availability queues, clearing your reminders?"
                      },
                      buttonIndex => {
                        this.setState({ clicked: CLEAR_ALL_BUTTONS[buttonIndex] });
                        switch(buttonIndex) {
                        case 0: clearAllNotifications(); break;
                        }
                      }
                    )}
                  >
                <Icon name="notifications-off" style={styles.navButtonStyle}/>
              </Button>
            </Left>
            <Body>
              <Title style={styles.titleStyle}>Lndry</Title>
            </Body>
            <Right/>
          </Header>
          <InputGroup borderType="underline" >
            <Icon name="ios-search" style={styles.searchStyle}/>
            <Input placeholder="Search Laundromats" onChangeText={(term) => { this.searchUpdated(term) }} />
          </InputGroup>
          <Content refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={()=>
            {this.updateContent()}}/>
            }>
            <ScrollView>
              {filteredLaundromats.map(laundromat => {
              var openWashers = laundromat.client.washers.filter(c => c === "0").length;
              var openDryers = laundromat.client.dryers.filter(c => c === "0").length;
              var washerStyle = styles.laundromatOpen;
              var dryerStyle = styles.laundromatOpen;
              var colBar = allOpen;

              if (BRICKHACK) {
                if (laundromat.id == 1) {
                  openWashers = piVal;
                }
              }

              // Oh my god you can use emojis in code...
              // Swap text based on view element
              var txtWasher = "💧 " + openWashers + " washers available";
              var txtDryer = "🔥 " + openDryers + " dryers available";
              if (openWashers == 0) {
                washerStyle = styles.laundromatFull;
                txtWasher = "😔 " + openWashers + " washers available";
              }
              if (openDryers == 0) {
                dryerStyle = styles.laundromatFull;
                txtDryer = "😔 " + openDryers + " dryers available";
              }

              if (openWashers == 0 || openDryers == 0) colBar = someOpen;
              if (openWashers == 0 && openDryers == 0) colBar = noneOpen;

              if (laundromat.client.name.length < 2) {
                txtWasher = "";
                txtDryer = "";
                colBar = colBarLoading;
              }

              return (
              <TouchableOpacity key={laundromat.id} style={styles.laundryItem} onPress={() =>
                ActionSheet.show(
                {
                options: MAKE_REMINDER_BUTTONS,
                cancelButtonIndex: MAKE_REMINDER_CANCEL_INDEX,
                title: "Toggle availability notifications for " + laundromat.client.name + " machines."
                },
                buttonIndex => {
                this.setState({ clicked: MAKE_REMINDER_BUTTONS[buttonIndex] });
                switch(buttonIndex) {
                  case 0: setMachineNotification(laundromat.id + "W"); break;
                  case 1: setMachineNotification(laundromat.id + "D"); break;
                }
                }
                )}>
              <Card style={{borderRadius:4, overflow:'hidden'}}>
              <View style={{flexDirection: 'row', flex: 1}}>
                <View style={{backgroundColor:colBar}}>
                  <Text>&nbsp;</Text>
                </View>
                <View style={styles.colorsBarRight}>
                  <Text style={styles.laundromatName}>{laundromat.client.name}</Text>
                  <Text style={styles.laundromatLocation}>{laundromat.client.location}</Text>
                <View>
                <Text style={washerStyle}>
                  {txtWasher}
                </Text>
                <Text  style={dryerStyle}>
                  {txtDryer}
                </Text>
                  <View style={{paddingBottom:4}}>
                  </View>
                </View>
                </View>
              </View>
              </Card>
            </TouchableOpacity>
            )
            })}
          </ScrollView>
          </Content>
        </Container>
      </Root>
    );
  }
}

/* Styling, colors */
const navColor = '#8E44AD';
const accentColor = '#FFFFFF';
const allOpen = '#27AE60';
const someOpen = '#AB69C6';
const noneOpen = '#F39C12';
const colBarLoading = '#C5D3E2';
const styles = StyleSheet.create({
/* Header style */
headerStyle: {
  backgroundColor: navColor,
  borderBottomWidth: 0
},
/* Title style */
titleStyle: {
  color: accentColor
},
/* Navigation style */
navButtonStyle: {
  color: accentColor
},
/* List container */
container: {
  flex: 1,
  backgroundColor: "#FFFFFF",
  justifyContent: "flex-start"
},
/* List */
laundryItem:{
  borderBottomWidth: 0,
  borderColor: "rgba(0,0,0,0.25)",
  padding: 4,
  paddingBottom: 0,
  shadowColor: '#000000',
  shadowOffset: {
    width: 0,
    height: 0
  },
  shadowRadius: 5,
  shadowOpacity: 0.1
},
/* Laundromat name ('Sol Heumann Hall') */
laundromatName:{
  fontSize: 20,
  paddingTop: 4,
  paddingBottom: 2
},
/* Laundromat location ('Rochester Institute of Technology') */
laundromatLocation: {
  fontSize: 16,
  color: "rgba(0,0,0,0.5)",
  paddingBottom: 8
},
/* Washer and dryer availability ('n washers available') */
laundromatFull: {
  color: noneOpen,
  fontSize: 18,
  paddingBottom: 4
},
/* '' occupied */
laundromatOpen: {
  color: allOpen,
  fontSize: 18,
  paddingBottom: 4
},
/* Searchbar icon */
searchStyle: {
  color: navColor
},
/* Searchbar */
searchInput:{
  padding: 10,
  borderColor: "#CCC",
  borderWidth: 1
},
/* Padding on right-side of color strip*/
colorsBarRight:{
  paddingLeft:10
},
});
