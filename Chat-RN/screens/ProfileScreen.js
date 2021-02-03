import React from 'react';
import { Container, Content, View, Text } from 'native-base';
import { withChatContext } from '../context/ChatProvider';
import { Header, Avatar } from '../components';
import { Strings } from '../config';
import styles from './styles/profile';

class ProfileScreen extends React.Component {

    render() {
        let contact = this.props.chat.contact;
        let status = this.props.chat.status();
        return (
            <Container>
                <Header title={Strings.TITLE_PROFILE} />
                <Content>
                    <View style={styles.avatarContainer}>
                        <View>
                            <Avatar source={contact.avatar} type='profile' />
                            <Text style={styles.name}>{contact.name}</Text>
                            <Text note style={styles.status}>{status}</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.about}>
                            {contact.about || Strings.DEFAULT_STATUS_MESSAGE}
                        </Text>
                    </View>
                </Content>
            </Container>
        );
    }
}

export default withChatContext(ProfileScreen);