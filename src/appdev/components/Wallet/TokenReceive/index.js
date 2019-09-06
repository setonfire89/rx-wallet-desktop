import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';
import { createNotification } from 'utils/helper';

var Web3 = require('web3');
var QRCode = require('qrcode.react');

@inject(stores => ({
  selectedWallet : stores.walletStore.selectedwallet,
  wallets : stores.walletStore.walletlist,
  LoadTransactionByAddress : addr => stores.walletStore.LoadTransactionByAddress(addr),
  loadWallet: () => stores.walletStore.loadWallet(),
  setCurrent: current => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language
}))

@observer
class TokenReceive extends Component {

  state = {
  }

  inputEl1 = null;

  componentDidMount(){
    this.loadwallet();
  }
  
  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  loadTransaction = () => {
    this.props.LoadTransactionByAddress(this.props.selectedWallet.publicaddress);
  }

  loadwallet = () => {
    this.props.loadWallet();
  }

  back = () => {
    this.props.setCurrent('walletdetail');
  }

  copy = () => {
    this.inputEl1.select();
    document.execCommand('copy');
    createNotification('info',intl.get('Info.CopyDone'));
    console.log("COPY DONE");
  }

  render() {
    return (
      <div className="tokenreceivepanel fadeInAnim">
        <div className="title" ><span><img onClick={this.back} width="20px" src="../../static/image/icon/back.png" /></span><span style={{marginLeft:"20px"}}>{intl.get('Token.ReceiveToken')}</span></div>
        <div className="centerpanel">
          <center>
            <div className="inputwrapper">
              <div style={{marginBottom:"10px"}} className="subtitle" >{this.props.selectedWallet.walletname}</div>
              <QRCode fgColor="#192c57" size="256" value={this.props.selectedWallet.publicaddress} style={{marginBottom:"30px"}} />
              <div className="panelwrapper borderradiusfull" style={{width:"500px"}}>
                {this.props.selectedWallet.publicaddress}
                <div className="copyicon"><img src="../../static/image/icon/copy.png" onClick={this.copy} /></div>
              </div>

              <input style={{marginTop:-99999,position:"absolute"}} ref={(input) => { this.inputEl1 = input; }} type="text" value={this.props.selectedWallet.publicaddress} id="hiddenphase" />
            </div>
          </center>
        </div>
      </div>
    );
  }
}

export default TokenReceive;