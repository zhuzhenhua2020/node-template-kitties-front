import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'
import { count } from 'rxjs'

export default function Kitties (props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')

  const fetchKitties = () => {
    // TODO: 在这里调用 `api.query.kittiesModule.*` 函数去取得猫咪的信息。
    // 你需要取得：
    //   - 共有多少只猫咪
    //   - 每只猫咪的主人是谁
    //   - 每只猫咪的 DNA 是什么，用来组合出它的形态
    
    // console.log("call fetchKitties status:"+status);

    // kittiesfromblockchain();

    // (async function () {
    //   var count =await api.query.kittiesModule.kittiesCount();
    // })();

  }

  const populateKitties = () => {
    // TODO: 在这里添加额外的逻辑。你需要组成这样的数组结构：
    // 这个 kitties 会传入 <KittyCards/> 然后对每只猫咪进行处理

    // console.log("call populateKitties status:"+status);

    // 根据状态，决定是否需要重新获取数据
    switch(status) {
      case '':
      case 'Current transaction status: InBlock':
        kittiesfromblockchain();
        break;
      case 'Sending...':
      case 'Current transaction status: Ready':
      default:
        break;
    }
    
  }

  const kittiesfromblockchain = () => {
    console.log("call kittiesfromblockchain");

    api.query.kittiesModule.kittiesCount().then((result) => {    
      if (result.value.isEmpty== false)   {
        //获取 Kitty 总数量
        const count = result.value.words[0];  
        const arr= [...Array(count).keys()];
        
        //获取所有的 Kitty 的 DNA 放到 kittiednas
        api.query.kittiesModule.kitties.multi(arr, (kittiednas) => {
          //获取所有 Kitty 的拥有者 
          api.query.kittiesModule.owner.multi(arr, (owner) => {  
            const kitties = [] ;
            owner.forEach((address, index) => {
              // console.log(kittiednas[index].value);
              // console.log(kittiednas[index].unwrap().toU8a());   
              // 组成指定的数组结构，放入到 kitties（用于显示）
              kitties.push({
                id: index,
                dna: kittiednas[index].unwrap().toU8a(), 
                owner: address.toString(),
              });
            });
            setKitties(kitties);
          });
        });
      }
    });
  }

  useEffect(fetchKitties, [api, keyring])   //状态 (api, keyring) 改变时触发方法 fetchKitties
  useEffect(populateKitties, [status])      //状态 (status) 改变触发方法 populateKitties

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'kittiesModule',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
