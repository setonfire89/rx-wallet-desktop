//import wanUtil from "wanchain-util";
import { Row, Col } from 'antd';
import React, { Component } from 'react';
import { Button, message, Steps } from 'antd';
import SideBar from '../Sidebar';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

import './index.less';
import WalletListing from 'components/Wallet/WalletListing';
import WalletCreation from 'components/Wallet/WalletCreation';
import WalletKeyInSeed from 'components/Wallet/WalletKeyInSeed';
import WalletCreated from 'components/Wallet/WalletCreated';
import WalletDetail from 'components/Wallet/WalletDetail';
import SelectedWallet from 'components/Wallet/SelectedWallet';
import TokenAssetList from 'components/Wallet/TokenAssetList';
import WalletNameEntry from 'components/Wallet/WalletNameEntry';
import WalletTypeSelection from 'components/Wallet/WalletTypeSelection';
import TokenTransfer from 'components/Wallet/TokenTransfer';
import TokenReceive from 'components/Wallet/TokenReceive';
import WalletRestorebySeed from 'components/Wallet/WalletRestorebySeed';
import WalletRestorebyPrivateKey from 'components/Wallet/WalletRestorebyPrivateKey';
import CreateShareWallet from 'components/Wallet/CreateShareWallet';
import TransactionDetail from 'components/Wallet/TransactionDetail';
import JoinShareWallet from 'components/Wallet/JoinShareWallet';
import TokenTransferConfirmation from 'components/Wallet/TokenTransferConfirmation';
import SplashBasicWalletCreation from 'components/Wallet/SplashBasicWalletCreation';
import BackupWalletTutorial from 'components/Wallet/BackupWalletTutorial';
import TokenTransferSuccessful from 'components/Wallet/TokenTransferSuccessful';
import ImportWalletTypeSelection from 'components/Wallet/ImportWalletTypeSelection';
import HWWalletSelection from 'components/Wallet/HWWalletSelection';
import HWWalletDetail from 'components/Wallet/HWWalletDetail';
import BasicWalletTypeSelection from 'components/Wallet/BasicWalletTypeSelection';
import Settings from 'components/Settings';
import Dex from 'components/Dex';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {
  HashRouter,
  Route
} from "react-router-dom";
//import { checkCryptographic, checkPhrase } from 'utils/support';

const Step = Steps.Step;

@inject(stores => ({
  /*
  pwd: stores.mnemonic.pwd,
  method: stores.mnemonic.method,
  mnemonic: stores.mnemonic.mnemonic,
  newPhrase: stores.mnemonic.newPhrase,
  isSamePwd: stores.mnemonic.isSamePwd,
  language: stores.languageIntl.language,
  isAllEmptyPwd: stores.mnemonic.isAllEmptyPwd,
  */
  current: stores.walletStore.current,
  changeTitle: newTitle => stores.languageIntl.changeTitle(newTitle),
  CreateEthAddress: () => stores.walletStore.CreateEthAddress(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  CreateEthAddress: () => stores.walletStore.CreateEthAddress(),
  setUserAccountExist : val => stores.session.setUserAccountExist(val),
  IsShowWalletListing : stores.session.IsShowWalletListing
}))

@observer
class Dashboard extends Component {
  state = {
    walletsteps: [{
      content: <WalletListing />,
      key:'walletlisting'
    },{
      content: <WalletTypeSelection />,
      key:'wallettypeselection'
    },{
      content: <WalletNameEntry />,
      key:'walletnameentry'
    },{
      content: <WalletCreation />,
      key:'walletcreation'
    },{
      content: <WalletKeyInSeed />,
      key:'walletkeyinseed'
    },{
      content: <WalletCreated />,
      key:'walletcreated'
    },{
      content: <WalletDetail />,
      key:'walletdetail'
    },{
      content: <SelectedWallet />,
      key:'selectedwallet'
    },{
      content: <TokenAssetList />,
      key:'tokenassetlist'
    },{
      content: <TokenTransfer />,
      key:'tokentransfer'
    },{
      content: <WalletRestorebySeed />,
      key:'walletrestorebyseed'
    },{
      content: <WalletRestorebyPrivateKey />,
      key:'walletrestorebyprivatekey'
    },{
      content: <CreateShareWallet />,
      key:'createsharewallet'
    },{
      content: <TokenReceive />,
      key:'tokenreceive'
    },{
      content: <JoinShareWallet />,
      key:'joinsharewallet'
    },{
      content: <TransactionDetail />,
      key:'transactiondetail'
    },{
      content: <TokenTransferConfirmation />,
      key:'tokentransferconfirmation'
    },{
      content: <SplashBasicWalletCreation />,
      key:'splashbasicwalletcreation'
    },{
      content: <BackupWalletTutorial />,
      key:'backupwallettutorial'
    },{
      content: <TokenTransferSuccessful />,
      key:'tokentransfersuccessful'
    },{
      content: <ImportWalletTypeSelection />,
      key:'importwallettypeselection'
    },{
      content: <HWWalletSelection />,
      key:'hwwalletselection'
    },{
      content: <HWWalletDetail />,
      key:'hwwalletdetail'
    },{
      content: <BasicWalletTypeSelection />,
      key:'basicwallettypeselection'
    },{
      content: <Settings />,
      key:'settings'
    },{
      content: <Dex />,
      key:'dex'
    }]
  }

  constructor(props) {
    super(props);
    this.props.changeTitle(intl.get('Dashboard.Title'));
    //this.props.CreateEthAddress();
  }
    
   componentDidMount(){

  }

  render() {
    const { walletsteps } = this.state;
    const { current,IsShowWalletListing } = this.props;

    var IsDoubleColumn = (
      current == "walletlisting" || 
      current == "tokentransfer" || 
      current == "tokenreceive" || 
      current == "transactiondetail" || 
      current == "walletdetail" ||
      current == "selectedwallet" || 
      current == "hwwalletselection" || 
      current == "tokenassetlist"
    );
    return (
      <Row className="container">
        <Col className="nav-left">
          <SideBar path={'/'}/>
        </Col>
        {IsDoubleColumn && 
          <div className="parent">
            <Col className="walletcol">
              <WalletListing />
            </Col>
            <Col className="main">
              <Row>
                {walletsteps.find(x => x.key === current).content}
              </Row>
            </Col>
          </div>
        }

        {!IsDoubleColumn &&
          <Col className="fullmain">
            <Row>
              {walletsteps.find(x => x.key === current).content}
            </Row>
          </Col>
        }
        <NotificationContainer/>
      </Row>
      // <Row className="container">
      //   <Col className="nav-left">
      //     <SideBar path={'/'}/>
      //   </Col>
      //   {IsDoubleColumn && 
      //     <div>
      //       <Col className="walletcol">
      //         <WalletListing />
      //       </Col>
      //       <Col className="main">
      //         <Row>
      //           <HashRouter>
      //               <Route path="/" exact component={ WalletDetail } />
      //               {
      //                 walletsteps.map((route,index)=>{
      //                   return(
      //                     <Route key={index} path={`/${route.key}`} component={ () => route.content} />
      //                   )
      //                 })
      //               }
      //           </HashRouter>
      //         </Row>
      //       </Col>
      //     </div>
      //   }

      //   {!IsDoubleColumn &&
      //     <Col className="fullmain">
      //       <Row>
      //         <HashRouter>
      //             <Route path="/" exact component={ WalletDetail } />
      //             {
      //               walletsteps.map((route,index)=>{
      //                 return(
      //                   <Route key={index} path={`/${route.key}`} component={ () => route.content} />
      //                 )
      //               })
      //             }
      //         </HashRouter>
      //       </Row>
      //     </Col>
      //   }
      //   <NotificationContainer/>
      // </Row>
    );
  }
}

export default Dashboard;