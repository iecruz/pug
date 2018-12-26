/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

import React from 'react';

class TaskInput extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let task = this.props.task;
        let error = this.props.error;

        return (
            <div id='taskModal' uk-modal='true'>
                <div className='uk-modal-dialog uk-modal-body'>
                    <button className='uk-modal-close-default' uk-close='true'></button>
                    <div className='uk-margin'>
                        <input type='text' name='title' className='uk-input' placeholder='Title' value={task.title} onChange={this.props.handleChangeInput}/>
                    </div>
                    <div className='uk-margin'>
                        <textarea name='description' className='uk-textarea' placeholder='Description' rows='1' style={{resize: 'none'}} value={task.description} onChange={this.props.handleChangeInput}></textarea>
                    </div>
                    <div className='uk-margin'>
                        <div className='uk-button-group uk-width-1-1 uk-child-width-1-3'>
                            <button className='uk-button uk-button-primary' onClick={this.props.handleChangeColor} data-value='primary'>Blue</button>
                            <button className='uk-button uk-button-default' onClick={this.props.handleChangeColor} data-value='default'>Light</button>
                            <button className='uk-button uk-button-secondary' onClick={this.props.handleChangeColor} data-value='secondary'>Dark</button>
                        </div>
                    </div>
                    <div className='uk-margin'>
                        <div className='uk-background-muted uk-padding-small'>
                            <div className={`uk-tile uk-padding-small uk-card uk-card-body uk-card-${task.color}`}>
                                <h2 className='uk-text-center'>{task.title || 'Enter title'}</h2>
                            </div>
                        </div>
                    </div>
                    <div className='uk-margin'>
                        <span className='uk-text-small uk-text-danger'>{error}</span>
                    </div>
                    <div className='uk-margin'>
                        <button type='submit' className='uk-button uk-button-primary uk-width-1-1' onClick={this.props.handleSubmit}>
                            <span className='uk-margin-small-right' uk-icon='icon: check'></span>
                            <span className='uk-text-middle'>Done</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

class Task extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let task = this.props.task;

        return (
            <div key={task._id}>
                <div className={`uk-card uk-card-body uk-card-${task.color} uk-inline uk-transition-toggle`}>
                    <h2 className='uk-text-center uk-margin-auto-vertical'>{task.title}</h2>
                    <div className='uk-transition-fade uk-overlay uk-overlay-primary uk-position-cover'></div>
                    <div className='uk-transition-fade uk-overlay uk-overlay-primary uk-position-cover'></div>
                    <div className='uk-transition-fade uk-overlay uk-overlay-primary uk-position-cover'>
                        <span className='uk-text-break uk-position-top-left uk-margin-small-top uk-margin-small-left uk-width-5-6'>{task.description || 'No description'}</span>
                        <div className='uk-position-bottom-right uk-margin-small-bottom uk-margin-small-right'>
                            <a href='#' className='uk-icon-button uk-margin-small-right' uk-icon='check' onClick={this.props.onDone}></a>
                            <a href='#' className='uk-icon-button uk-margin-small-right' uk-icon='pencil' uk-toggle='#taskModal' onClick={this.props.onModify}></a>
                            <a href='#' className='uk-icon-button' uk-icon='trash' onClick={this.props.onDelete}></a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default class TaskContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tasks: [],
            task: {
                title: '',
                description: '',
                color: 'default',
            },
            error: '',
            sequence: 0,
            modify: false
        };
    }

    componentDidMount() {
        let promise = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', '/api/tasks');
            xhr.onload = () => resolve(xhr.response);
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send();
        });

        promise.then(response => {
            this.setState({
                tasks: JSON.parse(response)
            });
        });

        promise.catch(message => console.log(message));
    }

    createTask(e) {
        e.preventDefault();
        
        let task = this.state.task;
        let tasks = this.state.tasks;

        let promise = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.onload = () => resolve(xhr);
            xhr.onerror = () => resolve(xhr);
            xhr.open('POST', '/api/tasks');
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send(JSON.stringify(task));
        });

        promise.then(res => {
            if(res.status !== 200) return this.setState({ error: res.responseText });

            this.setState({
                task: {
                    title: '',
                    description: '',
                    color: 'default',
                },
                error: '',
                sequence: 0,
                modify: false,
            });

            let newTask = JSON.parse(res.responseText);
            tasks.unshift(newTask);
            this.setState({ tasks });

            UIkit.modal('#taskModal').hide();
        });

        promise.catch(error => console.log(error));
    }

    updateTask(e) {
        e.preventDefault();
        
        let sequence = this.state.sequence;
        let modifiedTask = this.state.task;
        let tasks = this.state.tasks;

        let promise = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('PUT', `/api/tasks/${sequence}`);
            xhr.onload = () => resolve(xhr);
            xhr.onerror = () => reject(xhr);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send(JSON.stringify(modifiedTask));
        });

        promise.then(res => {
            if(res.status !== 200) return alert(res.responseText);

            let task = tasks.find(task => task.sequence === sequence);
            let { title, description, color } = modifiedTask;

            task.title = title;
            task.description = description;
            task.color = color;

            this.setState({
                task: {
                    title: '',
                    description: '',
                    color: 'default',
                },
                error: '',
                sequence: 0,
                modify: false,
            });
            
            UIkit.modal('#taskModal').hide();
        });
    }

    deleteTask(task) {
        let promise = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('DELETE', `/api/tasks/${task.sequence}`);
            xhr.onload = () => resolve(xhr);
            xhr.onerror = () => reject(xhr);
            xhr.send();
        });

        promise.then(res => {
            if(res.status !== 200) return alert(res.responseText);
            let tasks = this.state.tasks;
            let index = tasks.indexOf(task);
            tasks.splice(index, 1);
            this.setState({ tasks });
        });
    }

    doneTask(task) {
        task.done = true;

        let { title, description, color, done } = task;

        let promise = new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('PUT', `/api/tasks/${task.sequence}`);
            xhr.onload = () => resolve(xhr);
            xhr.onerror = () => reject(xhr);
            xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            xhr.send(JSON.stringify({ title, description, color, done }));
        });

        promise.then(res => {
            if(res.status !== 200) return alert(res.responseText);
            let tasks = this.state.tasks;
            let index = tasks.indexOf(task);
            tasks.splice(index, 1);
            this.setState({ tasks });
        });
    }

    handleModify(task) {
        let { sequence, title, description, color } = task;
        this.setState({ 
            task: { title, description, color },
            sequence,
            modify: true
        });
    }

    handleChangeInput(e) {
        let task = this.state.task;
        let value = e.target.value;
        let field = e.target.getAttribute('name');
        task[field] = value;
        this.setState({ task });
    }

    handleChangeColor(e) {
        let task = this.state.task;
        task.color = e.target.getAttribute('data-value');
        this.setState({ task });
    }

    render() {
        let tasks = this.state.tasks;
        let taskList = tasks.map(task => (
            <Task 
                key={task._id}
                task={task}
                onDone={() => this.doneTask(task)}
                onModify={() => this.handleModify(task)}
                onDelete={() => this.deleteTask(task)}
            />
        ));

        return (
            <div>
                <TaskInput 
                    task={this.state.task}
                    error={this.state.error}
                    handleSubmit={this.state.modify ? this.updateTask.bind(this) : this.createTask.bind(this)}
                    handleChangeInput={this.handleChangeInput.bind(this)}
                    handleChangeColor={this.handleChangeColor.bind(this)}
                />
                <div className='uk-grid-match uk-grid-small uk-child-width-1-2@s uk-child-width-1-3@m' uk-grid='true'>
                    <div>
                        <div className='uk-card uk-card-default'>
                            <button className='uk-button uk-button-default uk-width-1-1 uk-height-1-1 uk-padding' uk-toggle='target: #taskModal'>
                                <span className='uk-margin-small-right' uk-icon='icon: plus; ratio: 2'></span>
                            </button>
                        </div>
                    </div>
                    {taskList}
                </div>
            </div>
        );
    }
}
