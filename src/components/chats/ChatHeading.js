import React from 'react';
// import FAVideo from 'react-icons/lib/fa/video-camera'
// import FAUserPlus from 'react-icons/lib/fa/user-plus'
// import MdEllipsisMenu from 'react-icons/lib/md/keyboard-control'
// import FASearch from 'react-icons/lib/fa/search'
// import PropTypes from 'prop-types'

export default function({name, numberOfUsers}) {

	return (
		<div className="chat-header">
			<div className="user-info">
				<div className="user-name">{name}</div>
				<div className="status">
					<div className="indicator"></div>
					<span>{numberOfUsers ? numberOfUsers : null}</span>
				</div>
			</div>
      {/* <div className="search">
        <i className="search-icon"><FASearch /></i>
        <input placeholder="Search" type="text"/>
        <div className="plus"></div>
      </div> */}
			{/* <div className="options">
				<FAVideo />
				<FAUserPlus />
				<MdEllipsisMenu />
			</div> */}
		</div>
	);

}
