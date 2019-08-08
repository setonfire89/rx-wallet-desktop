import React, { Component } from 'react';
import { Input, Radio, Icon, Tooltip, Button } from 'antd';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';

import './index.less';
@inject(stores => ({
  setCurrent: current => stores.walletCreation.setCurrent(current),
  language: stores.languageIntl.language
}))

@observer
class WalletListing extends Component {
  state = {
    mobilevalue : ""
  }

  inputChanged = e => {
    this.setState({ mobilevalue : e.target.value }, () => {
      this.props.setMobile(this.state.mobilevalue);
    });
  }

  createWallet = () => {
    this.props.setCurrent(1);
  }

  render() {
    return (
      <div>
        <Button type="primary" onClick={this.createWallet}>Create Wallet{intl.get('Register.next')}</Button>
      </div>
    );
  }
}

export default WalletListing;