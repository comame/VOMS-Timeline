import React from 'react'
import { ChannelFilter, ChannelFilterSetter } from '../hooks/useChannelFilter'

export const Menu: React.FunctionComponent<{
    channelFilter: ChannelFilter,
    setChannelFilter: ChannelFilterSetter
}> = ({ channelFilter, setChannelFilter }) => {
    const onChangeHandler: React.ChangeEventHandler = (e) => {
        const target = (e.target as HTMLInputElement)
        const changedIndex = channelFilter.findIndex(it => {
            return it.name == target.value
        })!
        const newFilter = [ ...channelFilter ]
        newFilter[changedIndex].enable = target.checked
        setChannelFilter(newFilter)
    }

    const inputs = channelFilter.map(it => (
        <label key={ it.id }>
            <input
                type='checkbox'
                value={ it.name }
                checked={ it.enable }
                onChange={ onChangeHandler }
            />
            <span className='checked'></span>
            <span className='unchecked'></span>
            <span>{ it.name }</span>
        </label>
    ))

    return <div className='Menu'>
        <div className='label-wrap'>{ inputs }</div>
        <a href='https://github.com/comame/VOMS-Timeline' rel='noopener' target='_blank'>GitHub</a>
    </div>
}
