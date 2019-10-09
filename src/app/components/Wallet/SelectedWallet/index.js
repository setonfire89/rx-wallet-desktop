import React, { Component } from 'react';
import { Input, Radio, Icon, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import './index.less';
import { toJS } from "mobx";
import { toFixedNoRounding, numberWithCommas } from 'utils/helper';
import logo from 'static/image/graphic/logo.png';
import buttonreceive from 'static/image/icon/receive.png';
import buttonsend from 'static/image/icon/send.png';
import rivelogo500 from 'static/image/graphic/rivexlogo50opa.png';
import {
  AreaChart, defs, Area, linearGradient, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
var Web3 = require('web3');

@inject(stores => ({
  selectedWallet : stores.walletStore.selectedwallet,
  wallets : stores.walletStore.walletlist,
  gettrxlist : stores.walletStore.gettrxlist,
  LoadTransactionByAddress : addr => stores.walletStore.LoadTransactionByAddress(addr),
  wsGetMultiSigTrx : walletpublicaddress => stores.walletStore.wsGetMultiSigTrx(walletpublicaddress),
  loadWallet: () => stores.walletStore.loadWallet(),
  settrxdetail: (block,hash,from,to,value,action,gasprice,gasused,timestamp,nonce,confirmation,signers) =>stores.walletStore.settrxdetail(block,hash,from,to,value,action,gasprice,gasused,timestamp,nonce,confirmation,signers),
  setCurrent: current => stores.walletStore.setCurrent(current),
  language: stores.languageIntl.language,
  getTokenSparkLineByAssetCode: crypto => stores.walletStore.getTokenSparkLineByAssetCode(crypto),
  TokenSparkLine:stores.walletStore.TokenSparkLine,
  convertrate:stores.walletStore.convertrate,
  totalassetworth:stores.walletStore.totalassetworth,
  setselectedTokenAsset: tokenasset => stores.walletStore.setselectedTokenAsset(tokenasset)
}))

@observer
class SelectedWallet extends Component {

  state = {
    trxlist : []
  }

  componentDidMount(){
    this.props.getTokenSparkLineByAssetCode('rvx');
  }
  
  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  loadTransaction = () => {
    this.props.LoadTransactionByAddress(this.props.selectedWallet.publicaddress);
  }

  transferToken = () => {
    this.props.setCurrent("tokentransfer");
  }

  receiveToken = () => {
    this.props.setCurrent("tokenreceive");
  }

  openTokenDetail = (tokenitem) =>{
    this.props.setselectedTokenAsset(tokenitem);
    this.props.setCurrent('walletdetail');
    this.loadTransaction();
  }

  render() {
    // console.log(this.props.TokenSparkLine);
    return (
      <div className="selectedwalletpanel fadeInAnim">
        {this.props.selectedWallet.walletname != null &&
          <div>
            <div className="walletname" >{this.props.selectedWallet.walletname}</div>
            <div className="contentpanel">
              <div className="totalworth">
                <div className="amount">{numberWithCommas(parseFloat(this.props.totalassetworth),true)}</div>
                <div className="currency">USD</div>
              </div>
            </div>
            <div className="tokenwrapper">              
              {
                this.props.selectedWallet.tokenassetlist.map((item,index)=>{
                  return(
                    <div key={index} className="tokenassetitem" onClick={() => this.openTokenDetail(item)}>
                      <div className="tokenassetitemrow">
                        <img src={item.LogoUrl} />
                        <div className="infoctn">
                          <div className="assetcode">{item.AssetCode.toUpperCase()}</div>
                          <div className="assetcodename">{item.Name}</div>
                        </div>
                      </div>
                      <div className="tokenassetitemrow">
                        <div className="amountctn">
                          <div className="totalcoin">{item.TokenBalance ? `${item.TokenBalance % 1 != 0 ? toFixedNoRounding(item.TokenBalance,4) : toFixedNoRounding(item.TokenBalance,2)}` : `0.00`}<span>{item.AssetCode.toUpperCase()}</span></div>
                          <div className="totalcurrency">${numberWithCommas(parseFloat(!isNaN(this.props.convertrate * item.TokenBalance) ? this.props.convertrate * item.TokenBalance : 0),true)} USD</div>
                        </div>
                        <div className="chartctn">
                          <ResponsiveContainer width={'100%'} height={50}>
                            <AreaChart data={this.props.TokenSparkLine}>
                              <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="rgb(100, 244, 244)" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="rgb(28, 31, 70)" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="value" stroke="rgb(100, 244, 244)" fillOpacity={1} fill="url(#gradient)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="buttonctn">
                          <div className="btnitem">
                            <img src={buttonreceive} />
                          </div>
                          <div className="btnitem">
                            <img src={buttonsend} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </div>


        }
        
        {this.props.selectedWallet.walletname == null &&
          <div className='nowalletpanel'>
            <div className='label'>{intl.get('Wallet.SelectWallet')}</div>
            <img src={rivelogo500} />
          </div>
        }

      </div>
    );
  }
}

export default SelectedWallet;