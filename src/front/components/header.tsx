import React from 'react'
import { Clock } from './clock'

import '../assets/menu.svg'
import '../assets/checkbox.svg'
import '../assets/checkbox_blank.svg'


export const Header: React.FunctionComponent<{ toggleMenu: () => void }> = ({ toggleMenu }) => {
    return <header className='Header'>
        <a id='menu-hamburger' onClick={ toggleMenu } href='#'><img src='./menu.svg' alt='サイドバーのトグルボタン' /></a>
        <Clock />
    </header>
}
