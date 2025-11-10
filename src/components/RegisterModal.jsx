import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  IconButton,
  Typography,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { userService } from '../services';

const RegisterModal = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmPassword: '',
    cpf: '',
    cidade: '',
    uf: '',
    endereco: '',
    complemento: '',
    bairro: '',
    numero: '',
    cep: '',
    celular: '',
    telefone: '',
    dataNascimento: '',
    tipoPessoa: 'F',
    nomeFantasia: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatação automática para diferentes campos
    if (name === 'cpf') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (name === 'cep') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
    } else if (name === 'celular') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (name === 'telefone') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (name === 'uf') {
      formattedValue = value.toUpperCase();
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Remove error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear message when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const handleCEPBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');

    if (cep.length === 8) {
      setIsLoadingCEP(true);
      try {
        const result = await userService.searchCEP(cep);

        if (result.success) {
          setFormData(prev => ({
            ...prev,
            endereco: result.data.endereco,
            bairro: result.data.bairro,
            cidade: result.data.cidade,
            uf: result.data.uf
          }));

          // Remove erros dos campos preenchidos automaticamente
          setErrors(prev => ({
            ...prev,
            endereco: '',
            bairro: '',
            cidade: '',
            uf: ''
          }));
        } else {
          setMessage({
            type: 'warning',
            text: result.message
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setMessage({
          type: 'error',
          text: 'Erro ao buscar CEP. Preencha os dados manualmente.'
        });
      } finally {
        setIsLoadingCEP(false);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validação do nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validação do email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validação da senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validação da confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    // Validação do CPF
    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF deve ter 11 dígitos';
    }

    // Validação da cidade
    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    // Validação do UF
    if (!formData.uf.trim()) {
      newErrors.uf = 'UF é obrigatório';
    }

    // Validação do endereço
    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }

    // Validação do bairro
    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    }

    // Validação do número
    if (!formData.numero.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }

    // Validação do CEP
    if (!formData.cep) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (formData.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = 'CEP deve ter 8 dígitos';
    }

    // Validação do celular
    if (!formData.celular) {
      newErrors.celular = 'Celular é obrigatório';
    } else if (formData.celular.replace(/\D/g, '').length < 10) {
      newErrors.celular = 'Celular inválido';
    }

    // Validação da data de nascimento
    if (!formData.dataNascimento) {
      newErrors.dataNascimento = 'Data de nascimento é obrigatória';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await userService.register({
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha,
        cpf: formData.cpf.replace(/\D/g, ''),
        cidade: formData.cidade.trim(),
        uf: formData.uf.trim().toUpperCase(),
        endereco: formData.endereco.trim(),
        complemento: formData.complemento.trim(),
        bairro: formData.bairro.trim(),
        numero: formData.numero.trim(),
        cep: formData.cep.replace(/\D/g, ''),
        celular: formData.celular.replace(/\D/g, ''),
        telefone: formData.telefone.replace(/\D/g, ''),
        dataNascimento: formData.dataNascimento,
        tipoPessoa: formData.tipoPessoa,
        nomeFantasia: formData.nomeFantasia.trim()
      });

      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message
        });

        // Fechar modal após 5 segundos e notificar sucesso
        setTimeout(() => {
          onClose();
          onSuccess && onSuccess(result.data);
          // Reset form
          setFormData({
            nome: '',
            email: '',
            senha: '',
            confirmPassword: '',
            cpf: '',
            cidade: '',
            uf: '',
            endereco: '',
            complemento: '',
            bairro: '',
            numero: '',
            cep: '',
            celular: '',
            telefone: '',
            dataNascimento: '',
            tipoPessoa: 'F',
            nomeFantasia: ''
          });
          setMessage({ type: '', text: '' });
        }, 5000);
      } else {
        setMessage({
          type: 'error',
          text: result.message
        });
      }
    } catch (error) {
      console.error('Erro inesperado no cadastro:', error);
      setMessage({
        type: 'error',
        text: 'Erro inesperado. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Reset form when closing
      setFormData({
        nome: '',
        email: '',
        senha: '',
        confirmPassword: '',
        cpf: '',
        cidade: '',
        uf: '',
        endereco: '',
        complemento: '',
        bairro: '',
        numero: '',
        cep: '',
        celular: '',
        telefone: '',
        dataNascimento: '',
        tipoPessoa: 'F',
        nomeFantasia: ''
      });
      setErrors({});
      setMessage({ type: '', text: '' });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '600px',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddIcon />
          <Typography variant="h6" component="div">
            Criar Nova Conta
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isLoading}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {/* Mensagens de erro/sucesso */}
        {message.text && (
          <Alert
            severity={message.type}
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setMessage({ type: '', text: '' })}
          >
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Dados Pessoais */}
          <Grid container spacing={2}>

          </Grid>

          <Grid container spacing={2}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
              {/* Dados Pessoais */}
            </Typography>
            <Grid item xs={12} md={6} xl={6}>
              <TextField
                required
                fullWidth
                id="nome"
                label="Nome Completo"
                name="nome"
                autoComplete="name"
                autoFocus
                value={formData.nome}
                onChange={handleChange}
                error={!!errors.nome}
                helperText={errors.nome}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="cpf"
                label="CPF"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                error={!!errors.cpf}
                helperText={errors.cpf}
                disabled={isLoading}
                inputProps={{ maxLength: 14 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="dataNascimento"
                label="Data de Nascimento"
                name="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleChange}
                error={!!errors.dataNascimento}
                helperText={errors.dataNascimento}
                disabled={isLoading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="tipoPessoa-label">Tipo de Pessoa</InputLabel>
                <Select
                  labelId="tipoPessoa-label"
                  id="tipoPessoa"
                  name="tipoPessoa"
                  value={formData.tipoPessoa}
                  onChange={handleChange}
                  label="Tipo de Pessoa"
                  disabled={isLoading}
                >
                  <MenuItem value="F">Pessoa Física</MenuItem>
                  <MenuItem value="J">Pessoa Jurídica</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            {formData.tipoPessoa === 'J' && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="nomeFantasia"
                  label="Nome Fantasia"
                  name="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={handleChange}
                  error={!!errors.nomeFantasia}
                  helperText={errors.nomeFantasia}
                  disabled={isLoading}
                />
              </Grid>
            )}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Endereço */}
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Endereço
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                id="cep"
                label="CEP"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                onBlur={handleCEPBlur}
                error={!!errors.cep}
                helperText={errors.cep || (isLoadingCEP ? 'Buscando endereço...' : 'Ex: 01234-567')}
                disabled={isLoading || isLoadingCEP}
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  endAdornment: isLoadingCEP && (
                    <CircularProgress size={20} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="endereco"
                label="Endereço"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                error={!!errors.endereco}
                helperText={errors.endereco || (formData.endereco ? 'Preenchido automaticamente' : '')}
                disabled={isLoading || isLoadingCEP}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                required
                fullWidth
                id="numero"
                label="Número"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                error={!!errors.numero}
                helperText={errors.numero}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                id="complemento"
                label="Complemento"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                error={!!errors.complemento}
                helperText={errors.complemento}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                id="bairro"
                label="Bairro"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                error={!!errors.bairro}
                helperText={errors.bairro || (formData.bairro ? 'Preenchido automaticamente' : '')}
                disabled={isLoading || isLoadingCEP}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                required
                fullWidth
                id="cidade"
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                error={!!errors.cidade}
                helperText={errors.cidade || (formData.cidade ? 'Preenchido automaticamente' : '')}
                disabled={isLoading || isLoadingCEP}
              />
            </Grid>

            <Grid item xs={12} md={1}>
              <TextField
                required
                fullWidth
                id="uf"
                label="UF"
                name="uf"
                value={formData.uf}
                onChange={handleChange}
                error={!!errors.uf}
                helperText={errors.uf || (formData.uf ? 'Auto' : '')}
                disabled={isLoading || isLoadingCEP}
                inputProps={{ maxLength: 2 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Contato */}
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Contato
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                id="celular"
                label="Celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                error={!!errors.celular}
                helperText={errors.celular}
                disabled={isLoading}
                inputProps={{ maxLength: 15 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="telefone"
                label="Telefone Fixo"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                error={!!errors.telefone}
                helperText={errors.telefone}
                disabled={isLoading}
                inputProps={{ maxLength: 14 }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Senha */}
          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
            Senha de Acesso
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                name="senha"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                id="senha"
                autoComplete="new-password"
                value={formData.senha}
                onChange={handleChange}
                error={!!errors.senha}
                helperText={errors.senha}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirmar Senha"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          variant="outlined"
          sx={{ mr: 1 }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              Cadastrando...
            </Box>
          ) : (
            'Cadastrar'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterModal;